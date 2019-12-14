# crypto-encoder

[![Build Status](https://travis-ci.com/telamon/crypto-encoder.svg?branch=master)](https://travis-ci.com/telamon/crypto-encoder)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> [abstract-encoding](https://github.com/mafintosh/abstract-encoding) compatible secret key encoder using xchaha20/poly1305 constructs.


## <a name="install"></a> Install

```bash
npm install crypto-encoder
```

## <a name="usage"></a> Usage
Example using the crypto-encoder to encrypt the contents of a hypercore.
```js
const ram = require('random-access-memory')
const hypercore = require('hypercore')
const CryptoEncoder = require('crypto-encoder')
const crypto = require('crypto')

const secret = crypto.randomBytes(32)

const feed = hypercore(ram, {
  contenEncoding: new CryptoEncoder(secret, 'json')
})

feed.append({ aMessage: 'this entire block will be encrypted' })
```

Similar projects:

- [https://www.npmjs.com/package/xsalsa20-encoding](jwerle/xsalsa20-encoding)
- [https://github.com/little-core-labs/secretbox-encoding#readme](little-core-labs/secretbox-encoding)
- [https://www.npmjs.com/package/crypto-encoder](ameba23/crypto-encoder)

## <a name="contribute"></a> Contributing

Ideas and contributions to the project are welcome. You must follow this [guideline](https://github.com/telamon/crypto-encoder/blob/master/CONTRIBUTING.md).

## License

GNU AGPLv3 © Tony Ivanov
