See https://github.com/rotaready/moment-range

This gets you an .MJS version of moment-range, which can then be used with the --experimental-modules flag in Node.

###Installalation:
```
npm install CommiNazi/moment-range-esm --save
```

--Note that moment.js is a peer dependency and you'll need to install that as well.

###Import using ES6 syntax:
```javascript
//main.mjs
import Moment from "moment"
import { extendMoment } from "moment-range-esm"
const moment = extendMoment(Moment)
```
Remember to run your file with the experimental modules flag in Node:
```
node --experimental-modules ./main
```

###Testing
```
npm test
```
