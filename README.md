# vpaid-ad

VPAID ad class for extending purposes.

[![Build Status](https://travis-ci.org/kahwee/vpaid-ad.svg?branch=master)](https://travis-ci.org/kahwee/vpaid-ad)
[![npm version](https://badge.fury.io/js/vpaid-ad.svg)](https://badge.fury.io/js/vpaid-ad)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![bitHound Score](https://www.bithound.io/github/kahwee/vpaid-ad/badges/score.svg)](https://www.bithound.io/github/kahwee/vpaid-ad)
[![Greenkeeper badge](https://badges.greenkeeper.io/kahwee/vpaid-ad.svg)](https://greenkeeper.io/)
[![codecov](https://codecov.io/gh/kahwee/vpaid-ad/branch/master/graph/badge.svg)](https://codecov.io/gh/kahwee/vpaid-ad)

This is a reference implementation of VPAID ad. Feel free to extend this to suit your needs. It implements the most basic set of VPAID methods.

## Installing using npm

```sh
npm i --save vpaid-ad
```

## Usage

You can extend it using this way:

```js
const Linear = require('vpaid-ad/src/linear')
class VpaidAd extends Linear {
  initAd (width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
  	// Do something
    super.initAd(
      width,
      height,
      viewMode,
      desiredBitrate,
      creativeData,
      environmentVars
    )
  }
}

window.getVPAIDAd = function () {
  return new VpaidAd()
}
```

Your player can then call:

```js
vpaid = window.getVPAIDAd()
vpaid.subscribe(...)
```

### clickThru

There's a special clickThru method that you can use:

```js
vpaid.clickThru({
  url: 'https://example.com',
  id: 'my-id',
  playerHandles: true
})
```

The above function emits the parameters as both an object and as an array.

As an array:

```json
["https://example.com", "my-id", true]
```

As an object:

```json
{
  "url": "https://example.com",
  "id": "my-id",
  "playerHandles": true
}
```


## Resources

* [MailOnline's VPAIDHTML5Client](https://github.com/MailOnline/VPAIDHTML5Client)
