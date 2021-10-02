'use strict';

const Request = require('../models/userrequest.js');

class RequestList {
	
	constructor(ctx) {
		this.ctx = ctx;
		this.name = 'org.property-registration-network.regnet.lists.userrequest';
	}
	
	/**
	 * Returns the user model stored in blockchain identified by this key
	 * @param requestUserKey
	 * @returns {Promise<User>}
	 */
	async getUserRequest(requestUserKey) {
		let userRequestCompositeKey = this.ctx.stub.createCompositeKey(this.name, requestUserKey.split(':'));
		let userRequestBuffer = await this.ctx.stub.getState(userRequestCompositeKey);
		return Request.fromBuffer(userRequestBuffer);
	}
	
	/**
	 * Adds a user model to the blockchain by the registrar
	 * @param userRequestObject {User}
	 * @returns {Promise<void>}
	 */
	async addUserRequest(userRequestObject) {
		let userRequestCompositeKey = this.ctx.stub.createCompositeKey(this.name, userRequestObject.getKeyArray());
		let userRequestBuffer = userRequestObject.toBuffer();
		await this.ctx.stub.putState(userRequestCompositeKey, userRequestBuffer);
	}
	
	/**
	 * Updates a user model on the blockchain
	 * @param userRequestObject {User}
	 * @returns {Promise<void>}
	 */
	async updateUserRequest(userRequestObject) {
		let userRequestCompositeKey = this.ctx.stub.createCompositeKey(this.name, userRequestObject.getKeyArray());
		let userRequestBuffer = userRequestObject.toBuffer();
		await this.ctx.stub.putState(userRequestCompositeKey, userRequestBuffer);
	}
}

module.exports = RequestList;