FROM eclipse-temurin:21-jre-alpine
VOLUME /tmp
RUN apk add --no-cache curl
COPY ./build/libs/*.jar soccer-service.jar
ENTRYPOINT ["java", "-jar", "/soccer-service.jar"]


