
import Sequelize from "sequelize";
const sequelize = new Sequelize(
    'railway', //db name
    'root',// username 
    'IpIPoMyxHg62QxHYgCb2', //pwd
     {
       host: 'containers-us-west-164.railway.app',
       dialect: 'mysql',
       port:7313
     }
   );

   sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
 }).catch((error) => {
    console.error('Unable to connect to the database: ', error);
 });

export default sequelize;
 
 