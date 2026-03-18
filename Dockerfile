# Estágio 1: Build
FROM maven:3.8.4-openjdk-17 AS build
COPY . .
RUN mvn clean package -DskipTests

# Estágio 2: Execução
FROM openjdk:17-jdk-slim
# O comando abaixo usa um asterisco (*) para pegar qualquer arquivo .jar na pasta target
COPY --from=build /target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]