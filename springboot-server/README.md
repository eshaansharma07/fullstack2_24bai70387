# Spring Boot RESTful API Backend

This module is the **Spring Boot Java Backend** for SocialComposer, built in accordance with the enterprise backend and REST API fundamentals outlined in the lab curriculum.

---

## 1. Overview & Architecture

This backend implements a **4-Layer Enterprise Architecture**:

```
[ HTTP Client / React Frontend / Postman ]
                     │
                     ▼
           [ Controller Layer ]
       (@RestController, @RequestMapping)
                     │
                     ▼
            [ Service Layer ]
         (@Service, Business Logic)
                     │
                     ▼
          [ Repository Layer ]
       (Spring Data JPA / Hibernate)
                     │
                     ▼
          [ In-Memory Database ]
                 (H2 DB)
```

| Layer | Responsibility | Key Annotations & Technologies |
|---|---|---|
| **Controller** | Handles HTTP requests, input mapping, status codes | `@RestController`, `@RequestMapping`, `@Valid` |
| **Service** | Executes business logic, platform validation algorithms | `@Service`, `@Transactional`, DI |
| **Repository** | Database persistence & SQL query generation | `@Repository`, `JpaRepository<Post, Long>` |
| **Entity / DTO** | Schema definitions & validation contracts | `@Entity`, `@Table`, Jakarta Bean Validation (`@NotBlank`, `@Size`, `@Pattern`) |

---

## 2. Key Differences: Node.js (Express) vs Spring Boot

| Concept | Node.js (Express Backend) | Spring Boot (Java Backend) |
|---|---|---|
| **Runtime** | Node.js (V8 Engine) | Java Virtual Machine (JVM 17+) |
| **Build & Dependencies** | `npm` / `package.json` | `Maven` / `pom.xml` |
| **Server Engine** | Single-threaded Event Loop | Multi-threaded Embedded Tomcat |
| **Dependency Injection** | Manual imports / constructor passing | Automatic Spring IoC Container (`@Autowired`, Constructor DI) |
| **Request Dispatching** | Express Middleware chain | `DispatcherServlet` Front Controller |
| **Validation** | Custom functions / Joi / Zod | Declarative Bean Validation (`@Valid`, `@NotBlank`, etc.) |
| **Error Handling** | `(err, req, res, next)` middleware | `@RestControllerAdvice` & `@ExceptionHandler` |
| **Configuration** | `.env` / `process.env` | `application.yml` / `@Value` |

---

## 3. How to Run Locally

### Prerequisites
- **JDK 17+** (`java -version`)
- **Maven 3.8+** (`mvn -v`)

### Commands
```bash
# 1. Navigate to springboot-server directory
cd springboot-server

# 2. Compile and package
mvn clean package -DskipTests

# 3. Run the Spring Boot application
mvn spring-boot:run
```

The server will start on **`http://localhost:8080`**.

---

## 4. Interactive Documentation & Console

- **Swagger UI API Explorer**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON Docs**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)
- **H2 Database Web Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
  - JDBC URL: `jdbc:h2:mem:socialcomposerdb`
  - User: `sa`
  - Password: `password`
- **Actuator Health Endpoint**: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

---

## 5. REST Endpoints Summary

### Hello & Health
- `GET /hello` — Basic connectivity test (Hello from Spring Boot!)
- `GET /api/v1/health` — System health and JVM status

### Posts API (`/api/v1/posts`)
- `POST /api/v1/posts` — Create & publish new post (with Bean Validation)
- `GET /api/v1/posts` — Retrieve all posts
- `GET /api/v1/posts/{id}` — Get single post by ID
- `PUT /api/v1/posts/{id}` — Update existing post
- `DELETE /api/v1/posts/{id}` — Delete post
- `POST /api/v1/posts/validate` — Validate content against multi-platform rules

### Schedules API (`/api/v1/schedules`)
- `POST /api/v1/schedules` — Schedule social post for future publishing
- `GET /api/v1/schedules` — Retrieve all scheduled posts
- `GET /api/v1/schedules/{id}` — Get scheduled post by ID
- `PUT /api/v1/schedules/{id}` — Update schedule timing/content
- `DELETE /api/v1/schedules/{id}` — Cancel scheduled post

### Auth Simulation API (`/api/v1/auth`)
- `POST /api/v1/auth/login` — Validate credentials & issue simulated JWT
