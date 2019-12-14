const test = require('tape')
const CryptoEncoder = require('..')

test('crypto encoder', t => {
  t.plan(2)
  const secret = Buffer.from('deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef', 'hex')
  const message = 'Hello World'
  const codec = new CryptoEncoder(secret, 'utf-8')
  const encrypted = codec.encode(message)
  t.notEqual(encrypted.toString('utf8'), message)
  const decrypted = codec.decode(encrypted)
  t.equal(decrypted.toString('utf8'), message)
  t.end()
})
