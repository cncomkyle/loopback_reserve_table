import {Ottoman, set} from "ottoman";

// Setting Ottoman in debuggin mode
set('DEBUG', true);


const ottoman = new Ottoman({
  modelKey: 'type',
  scopeName: 'chbin_scope'
});

export {ottoman};

