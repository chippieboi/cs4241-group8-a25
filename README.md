# Final Project
Michael Lin, Breanna Lee, Tiffany Semexant, Ethan Carter, Isbael Cruz Rivera

### Turning in Your Project (Due Friday, October 10, 11:59 pm)
**Although the assignment is due at 11:59 pm, you must be prepared to demo your website in class that day.**

Submit a second PR on the final project repo to turn in your app and code. Again, only one pull request per team.

Render link: https://webware-group8.onrender.com

1. A brief description of what you created, and a link to the project itself (two paragraphs of text)
2. Any additional instructions that might be needed to fully use your project (login information, etc.)
3. An outline of the technologies you used and how you used them.
4. What challenges you faced in completing the project.
5. What each group member was responsible for designing / developing.
6. What accessibility features you included in your project.

Think of 1, 3, and 4 in particular in a similar vein to the design / technical achievements for A1—A4. Make a case for why what you did was challenging and why your implementation deserves a grade of 100%.

The video described above is also due on Canvas at this time.

1. Our project is a game that focuses on racing user-created animals. We have users log in and/or register their accounts to gain access to the home page. Each user is then greeted by our home page menu. You have the ability to create up to three custom animals. Creating animals comes with a name, an animal type, and allocating stat points to each of the four stats: speed, stamina, agility, and dexterity. Each animal type also boosts a specific stat. After the user creates at least one animal, they can race them! The race functionality works by doing some randomized math on the animal's stats to come up with a score to compare against the other animals in each race. Each race consists of 5 animals, and only one animal from the user who started the race. After all of the scores are calculated, the information is displayed on the page to show the places, the names of the animals, the user who created the animal, and the score. You can just keep clicking the race button as much as you want. If you want to swap animals, there is a drop-down to choose another animal. After racing, users will look at the history and leaderboard sections of the page. The leaderboard shows all users in the database alongside how many medals each user has won. Golds, silvers, and bronzes are the only places that count, and it doesn't matter which animal wins. The history section lets you browse previous races your animals have competed in. The only information not shown in history vs immediately after the race is the score; everything else is present.

2. Logging in should be super simple, but if you want an existing login you can use username: user1 and password: 123.

3. We used Express, MongoDB, Node, HTML, and CSS. Express was used for our server and for creating our routes. MongoDB was used to store our information. We had three tables: users, animals, and history. Figuring out how to structure our database to make all information available for what we wanted was the biggest challenge related to MongoDB. Node, HTML, and CSS are pretty self explanatory.

4. Figuring out the database structure in MongoDB took a lot of work and communication. This is because we had slightly different visions for what information would be readable on the website, and it resulted in a different database structure. We also struggled with what the website would look like at the start. Determining all of the actions users could take and how they would work under the hood took us a while to nail down before we finally started programming. Designing the edit or delete animal behaviors took a lot of work as well because of the history section. What should be shown in the history of a deleted animal? We discussed it a lot and decided to get rid of the editing function and keep deleting as the history functionality still works with it. The race functionality also took a lot of work to determine how to calculate score for placements. We ended up going with a bunch of different modifiers that determine the type of race and scale-specific attributes to make the result of each race slightly random while still prioritizing stat amounts.

5. Breanna: Create animal, delete animal, edit animal, live calculation of remaining points in create animal screen.
   Ethan: All race functionality - math, database storing, and visualization
   Isabel: Leaderboard functionality, login and register
   Michael: History functionality, login and register
   Tiffany: Visuals and styling. All of the HTML and CSS work

6. ALT tags for images and labels for form items.
