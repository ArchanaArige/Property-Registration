'use strict';

const PropertyRequest = require('../models/propertyrequest.js');

class PropertyRequestList {
	
	constructor(ctx) {
		this.ctx = ctx;
		this.name = 'org.property-registration-network.regnet.lists.propertyrequest';
	}
	
	/**
	 * Returns the property Request model stored in blockchain identified by this key
	 * @param propertyRequestKey
	 * @returns {Promise<property>}
	 */
	async getPropertyRequest(propertyRequestKey) {
		let propertyRequestCompositeKey = this.ctx.stub.createCompositeKey(this.name, propertyRequestKey.split(':'));
		let propertyRequestBuffer = await this.ctx.stub.getState(propertyRequestCompositeKey);
		return PropertyRequest.fromBuffer(propertyRequestBuffer);
	}
	
	/**
	 * Adds a property Request model to the blockchain by the registrar
	 * @param propertyRequestObject {Property}
	 * @returns {Promise<void>}
	 */
	async addPropertyRequest(propertyRequestObject) {
		let propertyRequestCompositeKey = this.ctx.stub.createCompositeKey(this.name, propertyRequestObject.getKeyArray());
		let propertyRequestBuffer = propertyRequestObject.toBuffer();
		await this.ctx.stub.putState(propertyRequestCompositeKey, propertyRequestBuffer);
	}
	
	/**
	 * Updates a property model on the blockchain
	 * @param propertyObject {Property}
	 * @returns {Promise<void>}
	 */
	async updatePropertyRequest(propertyRequestObject) {
		let propertyRequestCompositeKey = this.ctx.stub.createCompositeKey(this.name, propertyRequestObject.getKeyArray());
		let propertyRequestBuffer = propertyRequestObject.toBuffer();
		await this.ctx.stub.putState(propertyRequestCompositeKey, propertyRequestBuffer);
	}
}

module.exports = PropertyRequestList;