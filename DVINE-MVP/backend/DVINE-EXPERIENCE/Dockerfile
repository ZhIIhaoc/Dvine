# Use OpenJDK 17 image
FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy Maven wrapper and Maven project files
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY DVINE-API/pom.xml DVINE-API/
COPY DVINE-DAO/pom.xml DVINE-DAO/
COPY DVINE-SERVICE/pom.xml DVINE-SERVICE/

RUN chmod +x ./mvnw

# Download Maven dependencies
RUN ./mvnw dependency:go-offline -B

# Copy the source code
COPY DVINE-API/src DVINE-API/src
COPY DVINE-DAO/src DVINE-DAO/src
COPY DVINE-SERVICE/src DVINE-SERVICE/src

# Build the application
RUN ./mvnw clean package -DskipTests

EXPOSE 8080

# Start the application
CMD ["java", "-jar", "DVINE-API/target/DVINE-API-0.0.1-SNAPSHOT.jar"]