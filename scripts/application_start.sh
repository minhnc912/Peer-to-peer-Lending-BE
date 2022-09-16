#!/bin/bash

#give permission for everything in the express-app directory
sudo chmod -R 777 /home/ec2-user/capstone-project

#navigate into our working directory where we have all our github files
cd /home/ec2-user/capstone-project

#add npm and node to path
# export NVM_DIR="$HOME/.nvm"	
# [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # loads nvm	
# [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # loads nvm bash_completion (node is in path now)

#install node modules
npm install
# npm install --save-dev sequelize-cli

# #migration
# npx sequelize-cli db:migrate
#start our node app in the background
node bin/www.js > app.out.log 2> app.err.log < /dev/null & 
pm2 update bin/www.js
pkill node
