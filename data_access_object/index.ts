import mysql, { ConnectionOptions } from 'mysql2/promise';

const DataAcessObject = (connectionData: ConnectionOptions) => {
	this.connectionData = connectionData;
	this.pool = mysql.createPool(connectionData);
};

export default DataAcessObject;
