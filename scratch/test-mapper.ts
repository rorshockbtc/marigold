import { normalizeRowWithMapping } from '../src/lib/csv/universalMapper';

const rawRow = {
  "Mapping Value": "2328065727",
  "FIRST_NAME": "MYERS",
  "MIDDLE_NAME": "DECHANDLER",
  "LAST_NAME": "A'MONTAE",
  "SUFFIX": "",
  "RESIDENTIAL_ADDRESS": "214 MCGILVARY RD"
};

const result = normalizeRowWithMapping(rawRow);
console.log(JSON.stringify(result, null, 2));
