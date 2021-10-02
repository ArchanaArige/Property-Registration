'use strict';

const {Contract, Context} = require('fabric-contract-api');

const User = require('./lib/models/user.js');
const Request = require('./lib/models/userrequest.js')
const Property = require('./lib/models/property.js');
const PropertyRequest = require('./lib/models/propertyrequest.js');
const UserList = require('./lib/lists/userlist.js');
const RequestList = require('./lib/lists/userrequestlist.js');
const PropertyList = require('./lib/lists/propertylist.js');
const PropertyRequestList = require('./lib/lists/propertyrequestlist.js');

class RegistrarContext extends Context {
	constructor() {
		super();
		this.userList = new UserList(this);
		this.requestList = new RequestList(this);
		this.propertyList = new PropertyList(this);
		this.propertyRequestList = new PropertyRequestList(this);
	}
}

class RegistrarContract extends Contract {
	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.property-registration-network.regnet.registrar');
	}

	// Built in method used to build and return the context for this smart contract on every transaction invoke
	createContext() {
		return new RegistrarContext();
	}

	/* ****** All custom functions are defined below ***** */

	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('Registrar Smart Contract Instantiated');
	}

	/**
	 * The registrar initiates a transaction to register a new user on the ledger based on the request received
	 * @param ctx - The transaction context object
	 * @param name - Name of the user
	 * @param aadharNumber - aadharNumber of the user
	 * @returns user asset on the ledger
	 */
   async approveNewUser(ctx, name, aadharNumber) {
		     // A check to validate the authorised organisation is invoking the function call
		     this.validateOrganisation(ctx, "registrarMSP");
				 // Creates a composite key and fetches if the property request exists on the request list of the ledger
	        const userRequestKey = Request.makeKey([name, aadharNumber]);
		    	let userRequest = await ctx.requestList.getUserRequest(userRequestKey).catch(err => console.log('userRequest doesnt exist.Please provide correct name and aadharNumber'));
					// Creates a new composite key and fetches the user with given name, aadharNumber from blockchain
	        const userKey = User.makeKey([name, aadharNumber]);
		    	let existingUser = await ctx.userList.getUser(userKey).catch(err => console.log('user doesnt exist.Please provide correct name and aadharNumber'));
	        //Checking for the conditions user existence and user request existence on the ledger
	        //Making sure user request and user doesnt exist
					     	 if(existingUser !== undefined) {
							       throw new Error ('User already Approved');
				        	} else if(userRequest === undefined){
							       throw new Error('userRequest doesnt Exist');
					      	} else {
				                   // Create a user object to be stored in blockchain
			                       let userObject = {
				                                        name: userRequest.name,
			                                        	emailId: userRequest.emailId,
			                                        	phoneNumber: userRequest.phoneNumber,
			                                        	aadharNumber: userRequest.aadharNumber,
			                                        	approvedBy: ctx.clientIdentity.getID(),
			                                        	createdAt: userRequest.createdAt,
			                                        	upgradCoins: 0,
			                                        	updatedAt: new Date(),
		                                      		};
                      		// Create a new instance of user model and save it to blockchain
		                    	let newUserObject = User.createInstance(userObject);
		                    	await ctx.userList.addUser(newUserObject);
		                     	// Return value of new user account created to user
		                    	return newUserObject;
										}
	}
	/**
	 * This function is defined to view the current state of any user
	 * @param ctx - The transaction context object
	 * @param name - Name of the user
	 * @param aadharNumber - aadharNumber of the user
	 * @returns userObject
	 */
	async viewUser(ctx, name, aadharNumber) {
		    const userKey = User.makeKey([name, aadharNumber]);
	     	let userObject = await ctx.userList.getUser(userKey).catch(err => console.log('User doesnt exist.Please provide correct name and aadharNumber'));
        return userObject;
   }

  /**
	 * The registrar initiates a transaction to record a property asset on the ledger based on the request received
	 * @param ctx - The transaction context object
	 * @param propertyId - unique propertyId of the property
	 * @returns property asset on the ledger
	 */
    async approvePropertyRegistration(ctx, propertyId) {
	     	// A check to validate the authorised organisation is invoking the function call
		     this.validateOrganisation(ctx, "registrarMSP");
		    // Creates a composite key and fetches if the property request exists on the request list of the ledger
				 const propertyRequestKey = PropertyRequest.makeKey([propertyId]);
				 let propertyRequest = await ctx.propertyRequestList.getPropertyRequest(propertyRequestKey).catch(err => console.log('PropertyRequest doesnt exist.Please provide correct propertyId'));
				 // Creates a composite key and fetches if the property exists on the ledger
			 	 const propertyKey = Property.makeKey([propertyId]);
			 	 let existingProperty = await ctx.propertyList.getProperty(propertyKey).catch(err => console.log('Property doesnt exist.Please provide correct propertyId'));
         //checking for the conditions property existence on the ledger and propertyRequest present in the requestlist on the ledger
				       if(existingProperty !== undefined) {
						        throw new Error('Property already Approved');
				         } else if(propertyRequest === undefined) {
						        throw new Error('PropertyRequest doesnt exist');
			    	     } else {
			                  // update a property object to be stored in blockchain
		                  	   let propertyObject = {
				                                          propertyId: propertyRequest.propertyId,
				                                          price: propertyRequest.price,
				                                          owner: propertyRequest.owner,
				                                          status:'registered',
				                                          approvedBy: ctx.clientIdentity.getID(),
                                                  createdAt: propertyRequest.createdAt,
                                                  updatedAt: new Date(),
                                                };
                        	// Create a new instance of property model and save it to blockchain
		                    	let newPropertyObject = Property.createInstance(propertyObject);
			                    await ctx.propertyList.addProperty(newPropertyObject);
			                    // Return value of new property account
			                    return newPropertyObject;
		           }
	}

	/**
	 * This function is defined to view the property state of the user
	 * @param ctx - The transaction context object
	 * @param propertyId - unique propertyId of the property
	 * @returns propertyObject
	 */
  	async viewProperty(ctx, propertyId) {
		      const propertyKey = Property.makeKey([propertyId]);
		      let propertyObject = await ctx.propertyList.getProperty(propertyKey).catch(err => console.log('Property doesnt exist.Please provide correct propertyId'));
          return propertyObject;
   }

  /**
	 * A helper function to validate the identity of the organisation
	 * @param ctx - The transaction context object
	 * @param organisation - the MSPID of the organisation
	 */
   	validateOrganisation(ctx, organisation) {
	       	const orgMSPId = ctx.clientIdentity.getMSPID();
	      	if (orgMSPId !== organisation) {
			               throw new Error("Only users from Registrar Organisation can invoke this function call");
	      	}
    	}
}

module.exports = RegistrarContract;
