// SPDX-License-Identifier: GPL-3.0-or-later
/**
 * CryptoEncoder - AbstractEncoding Xsalsa20 encoder
 * @module @ciphercore/crypto-encoder
 */

const sodium = require('sodium-universal')

/** Class CryptoEncoder */
class CryptoEncoder {
  /**
   * Instantiates a new cryptoencoder.
   * @param {Buffer} secret - A buffer of length 32
   * @param {AbstractEncoding} codec - Optional extra content encoding to use before encryption / after decryption.
   */
  constructor (secret, codec) {
    this.secret = secret
    this.codec = codec
  }

  get hasSubDecoder () { return this.codec && typeof this.codec.decode === 'function' }
  get hasSubEncoder () { return this.codec && typeof this.codec.encode === 'function' }

  /**
   * Encodes a message using optional encoder if provided,
   * and then encrypts it using secret key and a randomly genenrated nonce.
   *
   * @param {Any} message - input message
   * @param {Buffer} buffer - Warning! Not implemented
   * @param {Number} offset - Warning! Not implemented
   * @returns {Buffer} encoded + encrypted data
   */
  encode (message, buffer, offset) {
    // Run originally provided encoder if any
    if (this.hasSubEncoder) {
      message = this.codec.encode(message, buffer, offset)
    }
    return this.secret ? CryptoEncoder.encrypt(message, this.secret) : message
  }

  /**
   * Decrypts an encrypted buffer and then decodes the content using optional encoder if
   * provided
   *
   * @param {Buffer} buffer - Encrypted data
   * @param {Number} start - Warning! Not implemented
   * @param {Number} end - Warning! Not implemented
   * @returns {Buffer} decrypted + decoded message
   */
  decode (buffer, start, end) {
    // TODO: warning i'm ignoring start & end here cause i cannot find
    // a single reference that uses it
    const message = this.secret ? CryptoEncoder.decrypt(buffer, this.secret) : buffer
    // Run originally provided encoder if any
    if (this.hasSubDecoder) return this.codec.decode(message)
    else return message
  }

  /**
   * Encryption methods
   **/

  /**
   * Encrypt data using 32byte encryption key.
   *
   * This is a static stateless method that can be used `CryptoEncoder.encrypt(...)`
   *
   * @param {Buffer} data - the message
   * @param {Buffer} encryptionKey - 32byte encryption key
   * @returns {Buffer} encrypted data.
   */
  static encrypt (data, encryptionKey) {
    if (!Buffer.isBuffer(data)) data = Buffer.from(data, 'utf-8')

    // Generate public nonce
    const nonceLen = sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
    const nonce = Buffer.alloc(nonceLen)
    sodium.randombytes_buf(nonce)

    // Allocate buffer for the encrypted result.
    const encLen = data.length + sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES + nonceLen
    const encrypted = Buffer.alloc(encLen)

    // Insert the public nonce into the encrypted-message buffer at pos 0
    nonce.copy(encrypted)

    // Encrypt
    const n = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      encrypted.slice(nonceLen),
      data,
      null, // ADDITIONAL_DATA
      null, // always null according to sodium-native docs
      nonce,
      encryptionKey
    )

    if (n !== encLen - nonceLen) throw new Error(`Encryption error, expected encrypted bytes (${n}) to equal (${encLen - nonceLen}).`)
    return encrypted
  }

  /**
   * Decrypts an encrypted buffer using 32byte encryption key.
   *
   * This is a static stateless method that can be used `CryptoEncoder.decrypt(...)`
   *
   * @param {Buffer} buffer - the previously encrypted data.
   * @param {Buffer} encryptionKey - 32byte encryption key
   * @returns {Buffer} decypted data.
   */
  static decrypt (buffer, encryptionKey) {
    const nonceLen = sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
    const nonce = buffer.slice(0, nonceLen) // First part of the buffer
    const encrypted = buffer.slice(nonceLen) // Last part of the buffer

    const messageLen = buffer.length - sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES - nonceLen
    const message = Buffer.alloc(messageLen)

    const n = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      message,
      null, // always null
      encrypted,
      null, // ADDITIONAL_DATA
      nonce,
      encryptionKey
    )

    if (n !== messageLen) throw new Error(`Decryption error, expected decrypted bytes (${n}) to equal expected message length (${messageLen}).`)
    return message
  }
}

module.exports = CryptoEncoder
