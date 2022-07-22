# Node Butler (backend).

Backend server for Node Butler.

Steps to run the project:
* Run the local mongodb database.
* Run the 'db-updater' task. This verifies the data in the local database and runs a recursive task to fetch data from the ICON blockchain and update the local database accordingly.
* Run the REST API. Gets data from the local mongodb database and serves this data to the clients via a REST API.
