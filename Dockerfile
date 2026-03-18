# Estágio 1: Build (Gera o arquivo .jar)
FROM maven:3.8.4-openjdk-17 AS build
COPY . .
RUN mvn clean package -DskipTests

# Estágio 2: Execução
FROM openjdk:17-jdk-slim
COPY --from=build /target/cinestack-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]