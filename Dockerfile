# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the project and build the executable jar plus bundled frontend assets.
COPY pom.xml ./
COPY src ./src
COPY frontend ./frontend
RUN mvn -B dependency:go-offline
RUN mvn -B clean package -DskipTests \
    && cp "$(find target -maxdepth 1 -name '*.jar' ! -name '*.original' | head -n 1)" /app/app.jar

# Stage 2: Create the minimal runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/app.jar ./app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
