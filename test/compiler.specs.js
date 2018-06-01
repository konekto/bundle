const {compileScripts, compileStyles, compile} = require('../src/compiler');
const fs = require('fs');
const assert = require('assert');
const cp= require('child_process');
const Promise = require('bluebird');

const exec = Promise.promisify(cp.exec);

describe('compiler specs', function() {

  this.timeout(4000);

  beforeEach((done)=> {

    exec('cp -a ./test/stubs-original/. ./test/stubs/')
      .then(exec('rm -rf ./test/tmp'))
      .then(done, done)
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

    it('should watch files for changes', function(done) {

      compileScripts({
        watch: true,
        sources: ['./*.jsx'],
        destination: './test/tmp',
        cwd: './test/stubs'
      })
        .then((instance)=> {

          const close = instance.close.bind(instance);

          assert(fs.existsSync('./test/tmp/test.js'));

          replaceInFile('./test/stubs/test.jsx', 'test', 'changed');

          return instance.filesHasChanged
            .then(()=> {

              assert(/changed/.test(fs.readFileSync('./test/stubs/test.jsx', 'utf8')));

              replaceInFile('./test/stubs/test.jsx', 'changed', 'test');
            })
            .then(()=> instance.filesHasChanged)
            .then(()=> {
              assert(/test/.test(fs.readFileSync('./test/stubs/test.jsx', 'utf8')));
            })
            .then(close, close)
        })
        .then(()=> done(), done)
    })

    it('should trigger event for changes', function(done) {

      compileScripts({
        watch: true,
        sources: ['./*.jsx'],
        destination: './test/tmp',
        cwd: './test/stubs'
      })
        .then((instance) => {

          let counter = 0;

          instance.onChange(function listener() {

            counter += 1;

            if(counter === 1) {

              return replaceInFile('./test/stubs/test.jsx', 'changed', 'test');
            }

            assert(counter === 2)

            instance.removeChangeListener(listener);
            instance.close();
            done();
          })

          replaceInFile('./test/stubs/test.jsx', 'test', 'changed');
        })

    })
  })

  describe('styles', function() {

    it('should compile a .styl file', function(done) {

      compileStyles({
        sources: ['./test.styl', './parent/styles.styl'],
        destination: './test/tmp',
        cwd: './test/stubs'
      })
        .then(()=> {

          assert(fs.existsSync('./test/tmp/test.css'));
          assert(fs.existsSync('./test/tmp/parent/styles.css'));
          done()
        })
        .catch(done)
    })

    it('should compile a glob', function(done) {

      compileStyles({
        sources: ['./**/*.styl'],
        destination: './test/tmp',
        cwd: './test/stubs'
      })
        .then(()=> {

          assert(fs.existsSync('./test/tmp/test.css'));
          assert(fs.existsSync('./test/tmp/parent/styles.css'));
          assert(fs.existsSync('./test/tmp/child/styles.css'));
          done()
        })
        .catch(done)
    })


    it('should include base styles', (done)=> {

      compileStyles({

        includes: ['./vars.styl'],
        sources: ['./main.styl'],
        destination: './test/tmp',
        cwd: './test/stubs'
      })
        .then(()=> {

          assert(/#f00/.test(fs.readFileSync('./test/tmp/main.css')))
          done();
        })
        .catch(done)
    })

    it('should watch files for changes', function(done) {

      compileStyles({

        watch: true,
        includes: ['./vars.styl'],
        sources: ['./main.styl'],
        destination: './test/tmp',
        cwd: './test/stubs'
      })
        .then((instance)=> {

          console.log('#f00')
          assert(/#f00/.test(fs.readFileSync('./test/tmp/main.css', 'utf8')));

          replaceInFile('./test/stubs/vars.styl', 'red', 'blue');

          return instance.filesHasChanged
            .then(() => {

              console.log('#00f')
              assert(/#00f/.test(fs.readFileSync('./test/tmp/main.css', 'utf8')))

              replaceInFile('./test/stubs/vars.styl', 'blue', 'red');

              return instance.filesHasChanged
                .then(() => {

                  console.log('#f00')
                  assert(/#f00/.test(fs.readFileSync('./test/tmp/main.css', 'utf8')))
                })
            }).finally(()=> instance.close())

        })
        .then(()=> done())
        .catch(done)
    })

    it('should watch imported files also', (done)=> {

      compileStyles({

        watch: true,
        sources: ['./with-imports.styl'],
        destination: './test/tmp',
        cwd: './test/stubs'
      })
        .then((instance) => {

          assert(/#f00/.test(fs.readFileSync('./test/tmp/with-imports.css', 'utf8')));

          replaceInFile('./test/stubs/vars.styl', 'red', 'blue');

          return instance.filesHasChanged
            .then(()=> assert(/#00f/.test(fs.readFileSync('./test/tmp/with-imports.css', 'utf8'))))
            .then(instance.close, instance.close)
        })
        .then(done, done)
    });
  })

  describe.only('compile', function(){

    it('should compile both styles and scripts', function(done) {

      compile({

        sources: ['./parent/*.*'],
        destination: './test/tmp',
        cwd: './test/stubs'
      })
        .then(()=> {

          assert(fs.existsSync('./test/tmp/parent/styles.css'));
          assert(fs.existsSync('./test/tmp/parent/index.js'));

          done();
        })
        .catch(done)
    })

    it('should watch both styles and scripts', function(done) {

      compile({
        watch: true,
        sources: ['./*.jsx', './*.styl'],
        destination: './test/tmp',
        cwd: './test/stubs'
      })
        .then((instance)=> {

          assert(fs.existsSync('./test/tmp/test.js'));
          assert(fs.existsSync('./test/tmp/test.css'));

          replaceInFile('./test/stubs/test.jsx', 'test', 'changed');

          return instance.filesHasChanged
            .then(()=> {

              assert(/changed/.test(fs.readFileSync('./test/stubs/test.jsx', 'utf8')));

              replaceInFile('./test/stubs/test.styl', 'red', 'blue');

              return instance.filesHasChanged
                .then(()=> assert(/#00f/.test(fs.readFileSync('./test/tmp/test.css', 'utf8'))))
                .then(()=> instance.close(), ()=> instance.close())
                .then(done)

            })

        })
        .catch(done)
    })

    it('should use the loaders', function(done) {

      compile({
        loader: true,
        sources: ['./parent/index.jsx'],
        destination: './test/tmp',
        cwd: './test/stubs'
      })
        .then(() => {

          assert(fs.existsSync('./test/tmp/parent/client.js'))
          assert(fs.existsSync('./test/tmp/parent/styles.css'))
          done();
        })
        .catch(done)
    })
  })
})


function replaceInFile(file, from, to) {

  const content = fs.readFileSync(file, 'utf8');

  console.log('replace');

  setTimeout(()=> {

    fs.writeFile(file, content.replace(from, to), (err)=> {

      console.log('replaced');
    });
  }, 1000)


}
