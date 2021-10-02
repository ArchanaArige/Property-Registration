1. Command to generate the crypto-materials:
./fabricNetwork.sh generate

2. Command to start the network
./fabricNetwork.sh up

3. Command to kill the network
./fabricNetwork.sh down

4. Command to install and instantiate the chaincode on the network
./fabricNetwork.sh install


5.Command to get into the project folder
cd ~/workspace/property-registration/network/

6. Command to remove the exited containers
docker rm $(docker ps -a -f status=exited -q)

7. install chaincode with dynamic/user defined version

./fabricNetwork.sh install -v 1.1

8. docker exec -it chaincode /bin/bash

9.SSH into peer0 container of users organisation : 
docker exec -it peer0.users.property-registration-network.com /bin/bash

10. invoke newUserRequest

peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel
-n regnet -c '{"Args":["org.property-registration-network.regnet.users:requestNewUser","Archna12",
"archana12@gmail.com","987654321","Aadhar12"]}'

peer chaincode invoke -o orderer.property-registration-network.com:7050 -C registrationchannel -n regnet -c '{"Args":["org.property-registration-network.regnet.users:requestNewUser","Archana246","archana246@gmail.com","9876543210","Aadhar246"]}'
