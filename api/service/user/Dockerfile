# ---- Build Stage ----
FROM gradle:8.5-jdk21 AS build

WORKDIR /app

COPY . .

RUN chmod +x gradlew || true
RUN ./gradlew :service:user:clean :service:user:build -x test --no-daemon

# ---- Runtime Stage ----
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/service/user/build/libs/*.jar ./
RUN find . -name "*.jar" ! -name "*-plain.jar" -exec mv {} app.jar \;

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]

