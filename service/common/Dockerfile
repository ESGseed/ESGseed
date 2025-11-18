FROM eclipse-temurin:21-jre-alpine
VOLUME /tmp
RUN apk add --no-cache curl
COPY ./build/libs/*.jar common-service.jar
ENTRYPOINT ["java", "-jar", "/common-service.jar"]

