// updater.js
// ============

module.exports = {
    
    
    windows: function () {
        console.log('Updating Windows')
    },

    linux: function (exec) {

    this.exec = exec;

    let Commands = "git fetch && git reset --hard HEAD && git merge '@{u}' && npm install && sudo reboot";

        exec(Commands, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        })


    },
    linux_2: function (){

        console.log('Updating Linux Step 2:')
    }
  };