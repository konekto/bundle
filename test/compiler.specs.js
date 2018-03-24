const {compileScripts, compileStyles} = require('../src/compiler');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const cp= require('child_process');
const {promisify} = require('bluebird');

const exec = promisify(cp.exec);

describe('compiler specs', function() {

   beforeEach((done)=> {

      exec('rm -rf ./test/tmp')
        .then(()=> done())
        .catch(done)
    })

  describe('scripts', function() {

    it('should compile a jsx file', function(done) {

       compileScripts({
         sources: ['./test.jsx'],
         destination: './test/tmp',
         cwd: './test/stubs'
       })
         .then(() => {

           assert(fs.existsSync('./test/tmp/test.js'))
           done();
         })
         .catch(done)
    });

    it('should use the client loader', function(done) {

      compileScripts({
         sources: ['./parent/index.jsx'],
         destination: './test/tmp',
         cwd: './test/stubs'
       })
         .then(() => {

           assert(fs.existsSync('./test/tmp/parent/index.js'))
           done();
         })
         .catch(done)
    })

    it('should compile using globbing', function(done) {

      compileScripts({
         sources: ['./**/*.jsx'],
         destination: './test/tmp',
         cwd: './test/stubs'
       })
         .then(() => {

           assert(fs.existsSync('./test/tmp/parent/index.js'));
           assert(fs.existsSync('./test/tmp/child/index.js'));
           assert(fs.existsSync('./test/tmp/test.js'));
           done();
         })
         .catch(done)
    })
  })

  describe.only('styles', function() {

    it('should compile a .styl file', function(done) {

      compileStyles({
        sources: ['./test.styl'],
        destination: './test/tmp',
        cwd: './test/stubs'
      })
        .then(()=> {

          assert(fs.existsSync('./test/tmp/test.css'));
          done()
        })
        .catch(done)
    })
  })
})