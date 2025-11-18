FROM eclipse-temurin:21-jre-alpine
VOLUME /tmp
RUN apk add --no-cache curl
COPY ./build/libs/*.jar config-server.jar
ENTRYPOINT ["java", "-jar", "/config-server.jar"]

