#VARAZZERS FESTIVAL WEBSITE

This is the repository for the Hypermedia and Web Applications Project of the academic year 2018/2019 (Computer Science Engineering
at Politecnico di Milano). 
Link to the website: https://silviaferrariswebsite.herokuapp.com/
I implemented a website for a festival in Varazze, that I called “Varazzers Festival”.
The aim of the festival is to help people after the disastrous floods that hit Varazze every year.

HOMEPAGE , NAVBAR AND FOOTER
In the homepage you will find an useful countdown which shows the next available event.
At the bottom you will find also a calendar that shows, for each day, if there is an event.

MAIN PAGES (EVENTS, SINGLE EVENT, PERFORMERS, SINGLE PERFORMER, SEMINAR)
In the “Events” page, you will find all the events of the festival. When you click on one event card, you will go to the
specific event page, that describes the event title, the date, the location .
Every event is linked to its performer and at the bottom you will find the cards of the related seminars and similar
events.(by date or by type)
Then, you can buy a ticket for an event, and in the shopping cart page you can increase or decrease the quantity of 
the tickets per each event you want to attend to.
In the same way, I implemented the seminar page and the performer page.

FOOTER
From the footer you can go to the faqs, that collect the most important and frequent questions and you can also click on 
the “reach us” link, which will remind you to a page that describes the city and how to reach it.The contact form doesn’t actually work.

REGISTRATION
The registration form is easy. When you enter your password, and create an account, before saving the pass on the database,
it will be crypted by a function that I implemented using an MD5 algoritm.

TICKETS-SHOPPING CART
If you added some items to your cart, and now you sign up, the items will appear in your private shopping cart.
If you added some items with your account, you can see them when you login.

LOGIN
Even login is simple: there is a single page  and you can also choose to “stay logged”. The “forgot password” doesn’t work.
When you login ,you can think to have the possibility to modify your profile, but actually this function is not implemented.
I implemented a private area to add events, performers and seminars to the database. You must login with these credentials: 
Username: silviaf96
Password:1234
And then, clicking on the login icon, you must go to the Dashboard page.

TECNOLOGIES:
I just used Jquery. No Ajax.
I dind’t use bootstrap or similars. It’s pure CSS.

DATABASE
The database is a PostgreSQL DB, live on heroku.  
In the DB I added trigger functions because I discovered that materialized view cound’t update automatically
when the related tables were modified.

API’S
Documentation of the APIs is written using Swagger 

