# ---- Build Stage ----
FROM gradle:8.5-jdk21 AS build

WORKDIR /app

COPY . .

RUN chmod +x gradlew || true
RUN ./gradlew :server:config:clean :server:config:build -x test --no-daemon

# ---- Runtime Stage ----
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/server/config/build/libs/*.jar ./
RUN find . -name "*.jar" ! -name "*-plain.jar" -exec mv {} app.jar \;

EXPOSE 8888

ENTRYPOINT ["java", "-jar", "app.jar"]