FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/scholartrack-backend.jar app.jar
# Keep memory small enough for free hosting tiers
ENV JAVA_TOOL_OPTIONS="-Xmx350m -XX:+UseSerialGC"
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
