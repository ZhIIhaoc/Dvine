# Backend Notice

## The project structure

> DVINE-EXPERIENCE is just an outter box which manage all dependencies within the sub-modules. For each sub-module, it have different responsibility for their functionality.

- **DVINE-API**  
This is all for the presentation layer. It includes all the APIs within the **controller** folder. And it has all dependencies of the DVINE-SERVICE. 
- **DVINE-SERVICE**  
This is the service/business/logic layer. It includes all the logic and internal stuff. All within the **service** folder.
- **DVINE-DAO**  
This is data access layer, which deal with all stuff of the communication or interaction between the service and database, and it does not deal any internal stuff of the database.


