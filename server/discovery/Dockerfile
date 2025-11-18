FROM eclipse-temurin:21-jre-alpine
VOLUME /tmp
RUN apk add --no-cache curl
COPY ./build/libs/*.jar discovery-server.jar
ENTRYPOINT ["java", "-jar", "/discovery-server.jar"]

