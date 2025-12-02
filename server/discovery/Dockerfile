# ---- Build Stage ----
FROM gradle:8.5-jdk21 AS build

WORKDIR /app

COPY . .

RUN chmod +x gradlew || true
RUN ./gradlew :server:discovery:bootJar -x test

# ---- Runtime Stage ----
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/server/discovery/build/libs/*.jar app.jar

EXPOSE 9000

ENTRYPOINT ["java", "-jar", "app.jar"]
