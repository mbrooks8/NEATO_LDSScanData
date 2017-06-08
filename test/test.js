var chai = require('chai');  
var assert = chai.assert;    // Using Assert style 
var expect = chai.expect;    // Using Expect style 
var should = chai.should();  // Using Should style 

const index = require('../index');

describe('tooClose', function(){

    it('should return a string', function(){
        let result = index.tooClose('./data.json');
        assert.typeOf(result, 'string');
    });
})