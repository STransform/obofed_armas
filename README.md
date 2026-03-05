
## IRMS

## Brief Description**

This is Integrated report management system developed for FDRE Ministry of Finance. 
172 federal organizations including Ministry of Finance currently use this system and contains 245 active users!.

# Technology Stack

The following are the core technologies used to build the application.

* Back-end: Springboot 
* Front-end: React js ,Vite 
* Database:MySQL


# Prerequisites and Dependencies
    Operating System: System has been tested on windows 10, Windows 11 and linux operating system. Since the project is developed using Springboot
    and it's dependencies theoretically it should be running in all operating systems including windows, linux

    Java version >= 17: Ensure you have the required java version installed on your system.
    
    Other dependencies: All additional libraries required for the project are listed in the `mvn` file and will be installed in following steps.


# Getting Started 

Follow the following steps to set up the development environment for your project.    

 ## Cloning the Repository to your local machine:
    * Use the provided command to download the project's codebase from GitHub.
    
    ```bash
    git clone https://github.com/STransform/mof_armas.git
    ```

 ## Setting Up the Environment and running it

    ## Create a virtual environment
        * This steps for Springboot backend
        ```bash
        $ cd armas-backend
          mvn spring-boot:run
        ```
    ## For React frontend
        ```bash
        $ cd armas-frontend
        npm install 
        npm run build
        npm start
        ```
## Configure applications.properties
    
Configuration of MySQL in application.properties, 
spring.application.name=armas_springboot-api
spring.jpa.database=mysql
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.password=Your db password
spring.datasource.username=root
spring.datasource.url=jdbc:mysql://localhost:3306/yourdb?serverTimezone=UTC
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

server.servlet.context-path=/
server.port=8080

rsa.private-key=classpath:certs/private.pem
rsa.public-key=classpath:certs/public.pem

ktg.secure.token.validity=2800
spring.sql.init.mode=never

# File size restrictions
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB
spring.servlet.multipart.enabled=true

# Mail Properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Logging
logging.level.org.springframework.web=DEBUG
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.web.cors=DEBUG
logging.level.com.kindsonthegenius.armas_springboot_api=DEBUG
logging.level.org.springframework=DEBUG
logging.level.org.hibernate=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

# Update base URL for production
site.base.url.https=http://localhost:8080 


## Access the application
    * You can then access your application by opening http://127.0.0.1:3000/ in your web browser.
    * Access the system : http://127.0.0.1:8000/

    Login page url:
    http://127.0.0.1:3000/login/



# Deployment:
The web app can be deployed on any hosting platform that supports Java.  

# Branching:
As a git repo, My repo will follow the common branching strategies. There are 2 main categories,armas-simon-branch and feature branches.
1. The armas-comment-branch is the development branch, which is actively being updated and/or merged with feature branches hence having the latest updates from all. Any individual who wants to trach the development of the system should continuously pull from the otechmain-dev branch
2. The other branches are feature branching which are intended to update specific features of the system. After they are completed they will be merged with the armas-simon-branch branch.
 
# Following Up:
Once you've cloned the repository using the provided instructions, if you intend to stay updated with the development process, it's important to take note: each time you pull updates from the development branch to your local machine, make sure to carefully review the commit messages. This practice guarantees the smooth operation of your local branch, minimizing the chances of encountering errors.


* By Simon Temesgen(S-Transform)
  
"A passionate developer skilled in Java programming,Oracle certified associates,oracle certified programmer,obtained basic java training and Advanced java training with numerous projects completed using Java technologies. 
Additionally, I develop projects using Django, the Python web framework, due to its simplicity."


