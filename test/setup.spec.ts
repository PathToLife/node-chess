import {version} from '../src/index';
import {expect} from 'chai';

describe('should import version', () => {
    it('should have version', function () {
        expect(version).to.exist;
        console.log(version);
    });
})
