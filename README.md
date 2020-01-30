# Mongoose Workshop - Exercise #2 - ToDo refs

Now we want to manage ToDos for users and store them in our MongoDB database.

Therefore we have to create a ToDo model. And set it into a relationship with the user.

## Task: Create Data Model

* Setup a ToDo model with the following fields
    * title (String), required
    * status (enum: "OPEN", "IN PROCESS", "DONE", "ON HOLD", "CANCELED"), default: "OPEN"

* Define the relationship between users & todos:
    * Clarify & fill in the "?" in the following two lines to get the right relationship type:
        * 1 user - ? todos
        * 1 todo - ? users

* Connect user schema and todo schema
    * Create a relationship either by nesting or reference
        * Consider the factors "relationship tightness", "update frequency" and growing potential"

### Bonus Task - Seed user todos

* Create a seed GET route /user/:id/todos/seed
    * Get the user ID from the url param (req.params.id)
    * Check if a user with that ID exists in the database
    * If so: Seed three todos here for this user
    * Return the todos to the browser
    
* Testing:
    * Look into your list of users in Compass and grab a valid user ID
    * Call your seed route with that ID (replace :id in the URL with the users real ID)
