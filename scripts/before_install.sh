#!/bin/bash

#create our working directory if it doesnt exist
DIR="/home/ec2-user/capstone-project"
if [ -d "$DIR" ]; then
  echo "${DIR} exists"
else
  echo "Creating ${DIR} directory"
  mkdir ${DIR}
fi