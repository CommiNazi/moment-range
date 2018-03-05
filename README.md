See https://github.com/rotaready/moment-range

<<<<<<< HEAD
This gets you an .MJS version of moment-range, which can then be used with the --experimental-modules flag in Node.

Installalation:
=======
This gets you an .MJS version of moment-range, which can then be used with the --experimental-modules flag in Node. 

Installalation: 
>>>>>>> 9f3605a23837f30d7400fd563ca9ab7c823cfb5c
```
npm install CommiNazi/moment-range-esm --save
```

Import using ES6 syntax:
<<<<<<< HEAD
```javascript
=======
```
>>>>>>> 9f3605a23837f30d7400fd563ca9ab7c823cfb5c
//main.mjs
import Moment from "moment"
import { extendMoment } from "moment-range-esm"
const moment = extendMoment(Moment)
```
Remember to run your file with the experimental modules flag in Node:
```
node --experimental-modules ./main
```

Testing
```
npm test
```
