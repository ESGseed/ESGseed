# ---- Build Stage ----
FROM gradle:8.5-jdk21 AS build

WORKDIR /app

COPY . .

RUN chmod +x gradlew || true
RUN ./gradlew :service:common:bootJar -x test

# ---- Runtime Stage ----
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/service/common/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
