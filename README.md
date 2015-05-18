
#Edison Setup

##Download latest Yocto Image for Intel Edison

http://downloadmirror.intel.com/24909/eng/edison-image-ww05-15.zip


##Follow these guidelines and come back after Setting Up Wifi

https://software.intel.com/en-us/iot/library/edison-getting-started

##Install this software

1. Following the instructions from before, get to the shell terminal on your Edison
2. Type "cd /node_app_slot" and hit enter
3. Type "npm install meshblu-j5-edison" and hit enter
4. That last step will take awhile, so get some coffee.
5. After it finishes installing you need to move the contents of /node_modules/meshblu-j5-edison up to /node_app_slot
6. Type "mv /node_modules/meshblu-j5-edison/* /node_app_slot" then hit enter
7. Type "reboot" and hit enter.


