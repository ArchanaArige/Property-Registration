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

class UserContext extends Context {
	constructor() {
		super();
		// Add various model lists to the context class object
		// this : the context instance
		this.userList = new UserList(this);
		this.requestList = new RequestList(this);
		this.propertyList = new PropertyList(this);
		this.propertyRequestList = new PropertyRequestList(this);
	}
}

class UserContract extends Contract {
	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.property-registration-network.regnet.users');
	}

	// Built in method used to build and return the context for this smart contract on every transaction invoke
	createContext() {
		return new UserContext();
	}

	/* ****** All custom functions are defined below ***** */

	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('Users Smart Contract Instantiated');
	}

	/**
	 * A request raised by newUser to the registrar to register on the network
	 * @param ctx - The transaction context object
	 * @param name - Name of the user
	 * @param emailId - Email ID of the user
	 * @param phoneNumber - phoneNumber of the user
	 * @param aadharNumber - aadharNumber of the user
	 * @returns userRequestObject
	 */
   async requestNewUser(ctx, name, emailId, phoneNumber, aadharNumber) {
		    // A check to validate the authorised organisation is invoking the function call
		    this.validateOrganisation(ctx, "usersMSP");
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
			        	} else if(userRequest !== undefined){
						       throw new Error('userRequest already Exists');
				      	} else {
			                   // Create a user object to be stored in blockchain
		                     let userRequestObject = {
				                                            name: name,
			                                            	emailId: emailId,
			                                             	phoneNumber: phoneNumber,
			                                             	aadharNumber: aadharNumber,
			                                            	requestedBy: ctx.clientIdentity.getID(),
			                                            	createdAt: new Date(),
	                                               };
		                  	// Create a new instance of user request model and save it to blockchain
			                  let newUserRequestObject = Request.createInstance(userRequestObject);
			                  await ctx.requestList.addUserRequest(newUserRequestObject);
			                  // Return value of new user account created to user
		                  	return newUserRequestObject;
									}
	}

  /**
	 * This function facilitates the user to recharge their account with upgrad coins
	 * @param ctx - The transaction context object
	 * @param name - Name of the user
	 * @param aadharNumber - aadharNumber of the user
	 * @param bankTransactionId - denominations of upgradCoins
	 * @returns updateduserObject
	 */
	 //As per assignment specification requirement, “status” is one of the input parameter to this function
   // After assignment walk through session, made clear that the status attribute can be added to property object in the approvePropertyRegistration function
   async rechargeAccount(ctx, name, aadharNumber, bankTransactionId) {
		    // A check to validate the authorised organisation is invoking the function call
		    this.validateOrganisation(ctx, "usersMSP");
				// Creates a new composite key and fetches the user with given name, aadharNumber from blockchain
        const userKey = User.makeKey([name, aadharNumber]);
        let userExists = await ctx.userList.getUser(userKey).catch(err => console.log('user doesnt exist.Please provide correct name and aadharNumber'));
	    	// Checking for the user existence on the ledger
				if(userExists === undefined) {
	                  throw new Error('User doesnt exist');
         	     }
				// validating the banktransaction id against predefined list of banktransactionIds
        let validateUpgradCoins = {
				                           	upg100: 100,
				                           	upg500: 500,
					                          upg1000:1000
			                           	};
				let rechargedUpgradCoins ;
				// for loop to return  price w.r.t specific bankTransactionId
				for(var k in validateUpgradCoins) {
				       	if(k == bankTransactionId) {
					             rechargedUpgradCoins = validateUpgradCoins[k];
					             break;
				        	}
			    	}
			  // updating the upgradCoins attribute of user object
	  	  if(rechargedUpgradCoins) {
		        userExists.upgradCoins = rechargedUpgradCoins+userExists.upgradCoins;
		      	userExists.updatedAt = new Date();
            // Create a new instance of updated user model and save it to blockchain
            let updatedUserObject = User.createInstance(userExists);
            await ctx.userList.addUser(updatedUserObject);
            // Return value of updated user account since the account has been recharged
            return updatedUserObject;
	  	} else {
			         throw new Error('Invalid BankTansactionId');
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
	 * A request raised by User to the registrar to register property on the network
	 * @param ctx - The transaction context object
	 * @param propertyId - unique propertyId of the property
	 * @param price - price of the property
	 * @param name - Name of the user
	 * @param aadharNumber - aadharNumber of the user
	 * @returns propertyRequestObject
	 */
  	async propertyRegistrationRequest(ctx, propertyId, price, name, aadharNumber) {
		      // A check to validate the authorised organisation is invoking the function call
		      this.validateOrganisation(ctx, "usersMSP");
	       // Creates a new composite key and fetches the user with given name, aadharNumber from blockchain
	       //let existingUser = this.viewUser(ctx, name, aadharNumber);
		      const userKey = User.makeKey([name, aadharNumber]);
		      let existingUser = await ctx.userList.getUser(userKey).catch(err => console.log('User doesnt exist.Please provide correct name and aadharNumber'));
	       // Creates a composite key and fetches if the property request exists on the request list of the ledger
	       // let propertyApproved = this.viewProperty(ctx, propertyId);
	        const propertyRequestKey = PropertyRequest.makeKey([propertyId]);
	        let existingPropertyRequest = await ctx.propertyRequestList.getPropertyRequest(propertyRequestKey).catch(err => console.log('PropertyRequest doesnt exist.Please provide correct propertyId'));
				 // Creates a composite key and fetches if the property exists on the ledger
	        const propertyKey = Property.makeKey([propertyId]);
	        let existingProperty = await ctx.propertyList.getProperty(propertyKey).catch(err => console.log('Property doesnt exist.Please provide correct propertyId'));
			  //checking for the conditions user existence and the property existence on the ledger
	           if(existingUser === undefined) {
	               throw new Error ('User doesnt exist');
	            } else if(existingProperty !== undefined){
		             throw new Error('Property already Approved');
	            } else if(existingPropertyRequest !== undefined){
							   throw new Error('PropertyRequest already Exists');
						  } else {
		                   let propertyRequestObject = {
		         	                                       propertyId:propertyId,
			                                               price:price,
					                                           owner:userKey,
					                                           requestedBy:ctx.clientIdentity.getID(),
			                                               createdAt: new Date(),
			                                              };
	                   	let newPropertyRequestObject = PropertyRequest.createInstance(propertyRequestObject);
	                  	await ctx.propertyRequestList.addPropertyRequest(newPropertyRequestObject);
	                  	return newPropertyRequestObject;
	             }
}

  /**
	 * This function is defined to view the property state of the user
	 * @param ctx - The transaction context object
	 * @param propertyId - propertyId of the user
	 * @returns propertyObject
	 */
	  async viewProperty(ctx, propertyId) {
		      const propertyKey = Property.makeKey([propertyId]);
		      let propertyObject = await ctx.propertyList.getProperty(propertyKey).catch(err => console.log('Property doesnt exist.Please provide correct propertyId'));
          return propertyObject;
   }

  /**
	 * This function is defined to update the attribute "status" of the property by the owner
	 * @param ctx - The transaction context object
	 * @param propertyId - unique propertyId of the property
	 * @param name - Name of the user
	 * @param aadharNumber - aadharNumber of the user
	 * @param status - status updating to "onsale"
	 * @returns propertyObject
	 */
     async updateProperty(ctx, propertyId, name, aadharNumber, status) {
		       // A check to validate the authorised organisation is invoking the function call
	       	 this.validateOrganisation(ctx, "usersMSP");
	      	 // Creates a new composite key and fetches the user with given name, aadharNumber from blockchain
		       const userKey = User.makeKey([name, aadharNumber]);
		       let userExists = await ctx.userList.getUser(userKey).catch(err => console.log('User doesnt exist.Please provide correct name and aadharNumber'));
		      // Creates a composite key and fetches if the property exists on the ledger
			     const propertyKey = Property.makeKey([propertyId]);
			     let propertyExists = await ctx.propertyList.getProperty(propertyKey).catch(err => console.log('Property doesnt exist.Please provide correct propertyId'));
         //checking for two conditions user existence and the property existence on the ledger
	      // Also check the owner and user invoking the function are same
	             if(userExists === undefined) {
	                   throw new Error ('User doesnt exist');
	               } else if(propertyExists === undefined){
		                 throw new Error('Property doesnt exist');
	               } else if(userKey !== propertyExists.owner ) {
				             throw new Error("Not Authorised: The owner of the property can only update");
			           } else {
			                   	propertyExists.status = status;
			                  	propertyExists.updatedAt = new Date();
	                      	let updatedProperyObject = Property.createInstance(propertyExists);
	                      	await ctx.propertyList.updateProperty(updatedProperyObject);
	                      	return updatedProperyObject;
								 }
	}

	/**
	 * This function facilitates the registered user to purchase a property that is listed for sale
	 * @param ctx - The transaction context object
	 * @param propertyId - unique propertyId of the property for which buyer initaties the transaction
	 * @param buyerName - Name of the buyer
	 * @param buyerAadharNumber - aadharNumber of the buyer
	 * @returns propertyObject
	 */
	  async purchaseProperty(ctx, propertyId, buyerName, buyerAadharNumber) {
		      // A check to validate the authorised organisation is invoking the function call
		      this.validateOrganisation(ctx, "usersMSP");
					// Creates a composite key and fetches if the buyer details exists on the ledger
		      const buyerKey = User.makeKey([buyerName, buyerAadharNumber]);
					let buyerInfo = await ctx.userList.getUser(buyerKey).catch(err => console.log('Buyer Details doesnt exist.Please provide correct name and aadharNumber'));
					// Creates a composite key and fetches if the property exists on the ledger
					const propertyKey = Property.makeKey([propertyId]);
					let propertyInfo = await ctx.propertyList.getProperty(propertyKey).catch(err => console.log('Property doesnt exist.Please provide correct propertyId'));
              //checking for the property details existence
							if(propertyInfo === undefined) {
										throw new Error('Property Details doesnt exist');
                  }
				  let sellerInfo = await ctx.userList.getUser(propertyInfo.owner).catch(err =>console.log('Seller details doesnt exist'));

		             	if(buyerInfo === undefined) {
				                  throw new Error('Buyer Details doesnt exist');
                    } else if(propertyInfo.status !== 'onsale') {
				                  throw new Error('Property is not listed for sale');
			              } else if(buyerInfo.upgradCoins < propertyInfo.price) {
			              	    throw new Error('Buyer doesnt have sufficient fund to purchase the property');
			              } else {
											        // Updating the seller Object
											        sellerInfo.upgradCoins = sellerInfo.upgradCoins + propertyInfo.price;
											        sellerInfo.updatedAt = new Date();
				                      // Updating the property Object and buyer Object
			                      	 propertyInfo.owner = buyerKey;
			                      	 propertyInfo.status = 'registered';
			                      	 propertyInfo.updatedAt = new Date();
			                       	 buyerInfo.upgradCoins = buyerInfo.upgradCoins - propertyInfo.price;
                               buyerInfo.updatedAt = new Date();

                               // Create a new instance of updated buyer model, seller model, property model and save it to blockchain
                    	         let updatedSellerInfo = User.createInstance(sellerInfo);
														   await ctx.userList.updateUser(updatedSellerInfo);

		                           let updatedBuyerInfo = User.createInstance(buyerInfo);
														   await ctx.userList.updateUser(updatedBuyerInfo);

		                           let updatedPropertyInfo = Property.createInstance(propertyInfo);
		                           await ctx.propertyList.updateProperty(updatedPropertyInfo);

		                           return updatedPropertyInfo;
	                 }
}

  /**
	 * A helper function to validate the identity of the organisation
	 * @param ctx - The transaction context object
	 * @param organisation - the MSPID of the organisation
	 */
	  validateOrganisation(ctx, organisation) {
	    	const orgMSPId = ctx.clientIdentity.getMSPID();
	        	if (orgMSPId !== organisation) {
			            throw new Error("Only users from Users Organisation can invoke this function call");
		         }
	}

}

	module.exports = UserContract;
