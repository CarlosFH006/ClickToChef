# Etapa de compilación
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
# Descarga dependencias primero (se cachea si pom.xml no cambia)
COPY pom.xml .
RUN mvn dependency:go-offline -q
# Luego copia el código fuente y compila
COPY src ./src
RUN mvn package -DskipTests -o

# Etapa de ejecución
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/ClickToChef-Server.jar app.jar
CMD ["java", "-jar", "app.jar"]