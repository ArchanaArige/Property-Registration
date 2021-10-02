#!/bin/bash

echo
echo " ____    _____      _      ____    _____ "
echo "/ ___|  |_   _|    / \    |  _ \  |_   _|"
echo "\___ \    | |     / _ \   | |_) |   | |  "
echo " ___) |   | |    / ___ \  |  _ <    | |  "
echo "|____/    |_|   /_/   \_\ |_| \_\   |_|  "
echo
echo "Updating Chaincode REGNET On Property Registration Network"
echo
CHANNEL_NAME="$1"
DELAY="$2"
LANGUAGE="$3"
VERSION="$4"
TYPE="$5"
: ${CHANNEL_NAME:="registrationchannel"}
: ${DELAY:="5"}
: ${LANGUAGE:="node"}
: ${VERSION:=1.2}
: ${TYPE="basic"}

LANGUAGE=`echo "$LANGUAGE" | tr [:upper:] [:lower:]`
ORGS="registrar users"
TIMEOUT=15

if [ "$TYPE" = "basic" ]; then
  CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/"
else
  CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode-advanced/"
fi

echo "New Version : "$VERSION

# import utils
. scripts/utils.sh

## Install new version of chaincode on peer0 of all 3 orgs making them endorsers
#echo "Updating chaincode on peer0.iit.certification-network.com ..."
#installChaincode 0 'iit' $VERSION
#echo "Updating chaincode on peer0.mhrd.certification-network.com ..."
#installChaincode 0 'mhrd' $VERSION
#echo "Updating chaincode on peer0.upgrad.certification-network.com ..."
#installChaincode 0 'upgrad' $VERSION

## Update(installing) new version of chaincode on peer0 and peer1 of  registrar and peer0 of users orgs making them endorsers
echo "Updating chaincode on peer0.registrar.property-registration-network.com.com ..."
installChaincode 0 'registrar' $VERSION
echo "Updating chaincode on peer1.registrar.property-registration-network.com.com ..."
installChaincode 1 'registrar' $VERSION
echo "Updating chaincode on peer0.users.property-registration-network.com.com ..."
installChaincode 0 'users' $VERSION

# Upgrade chaincode on the channel using peer0.iit
#echo "Upgrading chaincode on channel using peer0.iit.certification-network.com ..."
#upgradeChaincode 0 'iit' $VERSION

#Upgrade chaincode on the channel using peer0.registrar
echo "Instantiating chaincode on channel using peer0.registrar.property-registration-network.com.com ..."
instantiateChaincode 0 'registrar' $VERSION

echo
echo "========= All GOOD, Chaincode REGNET Is Now Updated To Version '$VERSION' =========== "
echo

echo
echo " _____   _   _   ____   "
echo "| ____| | \ | | |  _ \  "
echo "|  _|   |  \| | | | | | "
echo "| |___  | |\  | | |_| | "
echo "|_____| |_| \_| |____/  "
echo

exit 0
