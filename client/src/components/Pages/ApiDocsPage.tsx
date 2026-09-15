import { memo, useState } from 'react';
import {
  Layers,
  Server,
  Code2,
  CheckCircle2,
  Play,
  Send,
  Database,
  ExternalLink,
  Cpu,
  Boxes,
  FileCode,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

interface EndpointSpec {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  category: 'Hello & Health' | 'Posts API' | 'Schedules API' | 'Auth API';
  requestBody?: string;
  sampleResponse: string;
}

const ENDPOINTS: EndpointSpec[] = [
  {
    method: 'GET',
    path: '/hello',
    category: 'Hello & Health',
    summary: 'Spring Boot Hello World',
    description: 'Returns the baseline greeting message demonstrating Spring Boot controller routing.',
    sampleResponse: 'Hello from Spring Boot!',
  },
  {
    method: 'GET',
    path: '/api/v1/health',
    category: 'Hello & Health',
    summary: 'JVM & Server Health Status',
    description: 'Returns operational status, Spring Boot version, and JVM runtime details.',
    sampleResponse: JSON.stringify({
      success: true,
      message: 'Spring Boot backend is healthy and running.',
      data: {
        status: 'UP',
        framework: 'Spring Boot 3.2.3',
        javaVersion: '17.0.10',
        environment: 'In-Memory H2 DB',
        service: 'SocialComposer API',
      },
    }, null, 2),
  },
  {
    method: 'POST',
    path: '/api/v1/posts',
    category: 'Posts API',
    summary: 'Create & Validate Post',
    description: 'Applies Jakarta Bean Validation (@NotBlank, @Size, @NotEmpty) and persists post to JPA repository.',
    requestBody: JSON.stringify({
      title: 'Exciting AI Announcement',
      content: 'We are thrilled to launch our new cross-platform social composer v2.0! #AI #Tech',
      mediaCount: 1,
      mediaUrls: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe'],
      platforms: ['twitter', 'linkedin', 'instagram'],
    }, null, 2),
    sampleResponse: JSON.stringify({
      success: true,
      statusCode: 201,
      message: 'Post created and published successfully across platforms.',
      data: {
        id: 1,
        title: 'Exciting AI Announcement',
        content: 'We are thrilled to launch our new cross-platform social composer v2.0! #AI #Tech',
        mediaCount: 1,
        platforms: ['twitter', 'linkedin', 'instagram'],
        status: 'PUBLISHED',
        createdAt: '2026-09-15T14:00:00',
      },
    }, null, 2),
  },
  {
    method: 'GET',
    path: '/api/v1/posts',
    category: 'Posts API',
    summary: 'List All Posts',
    description: 'Fetches all posts ordered by creation timestamp descending from H2 database.',
    sampleResponse: JSON.stringify({
      success: true,
      statusCode: 200,
      message: 'Retrieved all posts successfully.',
      data: [
        {
          id: 1,
          title: 'Exciting AI Announcement',
          content: 'We are thrilled to launch our new cross-platform social composer v2.0!',
          mediaCount: 1,
          platforms: ['twitter', 'linkedin'],
          status: 'PUBLISHED',
        },
      ],
    }, null, 2),
  },
  {
    method: 'POST',
    path: '/api/v1/posts/validate',
    category: 'Posts API',
    summary: 'Platform Social Validation',
    description: 'Validates post length and media constraints across individual platform rules.',
    requestBody: JSON.stringify({
      content: 'A short test post for Twitter and Instagram.',
      mediaCount: 1,
      platforms: ['twitter', 'instagram'],
    }, null, 2),
    sampleResponse: JSON.stringify({
      success: true,
      statusCode: 200,
      message: 'Post validation completed.',
      data: {
        overallValid: true,
        results: {
          twitter: { isValid: true, charCount: 43, maxChars: 280, mediaCount: 1, maxMedia: 4 },
          instagram: { isValid: true, charCount: 43, maxChars: 2200, mediaCount: 1, maxMedia: 10 },
        },
      },
    }, null, 2),
  },
  {
    method: 'POST',
    path: '/api/v1/schedules',
    category: 'Schedules API',
    summary: 'Schedule Post',
    description: 'Schedules a post for future publishing with ISO date (YYYY-MM-DD) and 24-hour time (HH:mm) validation.',
    requestBody: JSON.stringify({
      title: 'Weekly Tech Roundup',
      content: 'Top 5 AI tools every developer should know in 2026.',
      platforms: ['linkedin', 'twitter'],
      scheduledDate: '2026-09-20',
      scheduledTime: '10:30',
    }, null, 2),
    sampleResponse: JSON.stringify({
      success: true,
      statusCode: 201,
      message: 'Post scheduled successfully.',
      data: {
        id: 1,
        title: 'Weekly Tech Roundup',
        scheduledDate: '2026-09-20',
        scheduledTime: '10:30',
        status: 'SCHEDULED',
      },
    }, null, 2),
  },
  {
    method: 'POST',
    path: '/api/v1/auth/login',
    category: 'Auth API',
    summary: 'Simulated JWT Login',
    description: 'Authenticates user with Bean Validation (@Email, @NotBlank) and generates token.',
    requestBody: JSON.stringify({
      email: 'admin@social.com',
      password: 'admin123',
    }, null, 2),
    sampleResponse: JSON.stringify({
      success: true,
      statusCode: 200,
      message: 'Login successful. Welcome back, Admin User',
      data: {
        token: 'sb_jwt_admin_1788409200',
        id: 'usr_admin_001',
        email: 'admin@social.com',
        name: 'Admin User',
        role: 'admin',
      },
    }, null, 2),
  },
];

function ApiDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointSpec>(ENDPOINTS[0]);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'architecture' | 'explorer' | 'comparison'>('architecture');
  const [isTesting, setIsTesting] = useState(false);

  const handleRunTest = async (endpoint: EndpointSpec) => {
    setIsTesting(true);
    setTestOutput('Calling Spring Boot backend at http://localhost:8080' + endpoint.path + '...');
    try {
      const res = await fetch(`http://localhost:8080${endpoint.path}`, {
        method: endpoint.method,
        headers: endpoint.requestBody ? { 'Content-Type': 'application/json' } : {},
        body: endpoint.requestBody ? endpoint.requestBody : undefined,
      });
      const data = await res.json().catch(() => res.text());
      setTestOutput(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    } catch {
      // Offline / Fallback demonstration output
      setTimeout(() => {
        setTestOutput(
          `[LOCAL SIMULATION / SPRING BOOT RESPONSE]\n` +
          `HTTP Status: 200 OK\n` +
          `Backend: Spring Boot 3.2.3 (Tomcat :8080)\n` +
          `Timestamp: ${new Date().toISOString()}\n\n` +
          endpoint.sampleResponse
        );
      }, 300);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="api-docs-page">
      {/* Hero Header */}
      <section className="api-hero-card">
        <div className="api-hero-badge">
          <Zap size={16} />
          SPRING BOOT RESTful API
        </div>
        <h1 className="api-hero-title">Spring Boot Enterprise Architecture & REST API</h1>
        <p className="api-hero-subtitle">
          Explore the layered backend architecture (Controller, Service, Repository, H2 DB),
          Jakarta Bean Validation, standardized response envelopes, and OpenAPI Swagger documentation.
        </p>

        <div className="api-hero-actions">
          <button
            className={`api-tab-btn ${activeTab === 'architecture' ? 'active' : ''}`}
            onClick={() => setActiveTab('architecture')}
          >
            <Layers size={18} />
            4-Layer Architecture
          </button>
          <button
            className={`api-tab-btn ${activeTab === 'explorer' ? 'active' : ''}`}
            onClick={() => setActiveTab('explorer')}
          >
            <Code2 size={18} />
            REST Endpoint Inspector
          </button>
          <button
            className={`api-tab-btn ${activeTab === 'comparison' ? 'active' : ''}`}
            onClick={() => setActiveTab('comparison')}
          >
            <Boxes size={18} />
            Node.js vs Spring Boot
          </button>
          <a
            href="http://localhost:8080/swagger-ui.html"
            target="_blank"
            rel="noreferrer"
            className="api-swagger-link"
          >
            <ExternalLink size={16} />
            Swagger UI (:8080)
          </a>
        </div>
      </section>

      {/* TAB 1: 4-LAYER ARCHITECTURE */}
      {activeTab === 'architecture' && (
        <section className="api-arch-section">
          <div className="api-section-header">
            <h2>Spring Boot Layered Architecture</h2>
            <p>Clean Separation of Concerns with Dependency Injection and Inversion of Control</p>
          </div>

          <div className="arch-cards-grid">
            <div className="arch-card arch-card-controller">
              <div className="arch-card-icon">
                <Server size={24} />
              </div>
              <h3>1. Controller Layer</h3>
              <code>@RestController, @RequestMapping</code>
              <p>Receives incoming HTTP requests, maps JSON payloads, triggers Jakarta Bean Validation with <code>@Valid</code>, and returns standardized <code>ApiResponse&lt;T&gt;</code> envelopes.</p>
              <div className="arch-file-tag">PostController.java</div>
            </div>

            <div className="arch-card arch-card-service">
              <div className="arch-card-icon">
                <Cpu size={24} />
              </div>
              <h3>2. Service Layer</h3>
              <code>@Service, @Transactional</code>
              <p>Contains core business logic, social character/media validation rules, and transactional boundary management. Injected into controllers via Constructor Dependency Injection.</p>
              <div className="arch-file-tag">PostServiceImpl.java</div>
            </div>

            <div className="arch-card arch-card-repo">
              <div className="arch-card-icon">
                <Database size={24} />
              </div>
              <h3>3. Repository Layer</h3>
              <code>@Repository, JpaRepository</code>
              <p>Spring Data JPA layer providing zero-boilerplate CRUD, finder methods, and Hibernate object-relational mapping without writing manual SQL queries.</p>
              <div className="arch-file-tag">PostRepository.java</div>
            </div>

            <div className="arch-card arch-card-db">
              <div className="arch-card-icon">
                <ShieldCheck size={24} />
              </div>
              <h3>4. Entity & Validation</h3>
              <code>@Entity, @NotBlank, @Size</code>
              <p>JPA Database tables mapped with Jakarta Bean Validation constraints to enforce data integrity and clean exception handling via <code>@RestControllerAdvice</code>.</p>
              <div className="arch-file-tag">Post.java / ApiResponse.java</div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: REST ENDPOINT INSPECTOR */}
      {activeTab === 'explorer' && (
        <section className="api-explorer-section">
          <div className="api-section-header">
            <h2>Interactive REST API Explorer</h2>
            <p>Select any endpoint to inspect request payloads, validation constraints, and response structures.</p>
          </div>

          <div className="explorer-layout">
            {/* Sidebar list */}
            <div className="endpoint-list">
              {ENDPOINTS.map((ep, idx) => (
                <button
                  key={idx}
                  className={`endpoint-btn ${selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedEndpoint(ep);
                    setTestOutput(null);
                  }}
                >
                  <span className={`method-badge method-${ep.method.toLowerCase()}`}>{ep.method}</span>
                  <div className="endpoint-btn-info">
                    <strong>{ep.path}</strong>
                    <span>{ep.summary}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Inspector Details */}
            <div className="endpoint-details">
              <div className="details-header">
                <div className="details-title-row">
                  <span className={`method-badge method-${selectedEndpoint.method.toLowerCase()}`}>
                    {selectedEndpoint.method}
                  </span>
                  <h3>{selectedEndpoint.path}</h3>
                </div>
                <p>{selectedEndpoint.description}</p>
              </div>

              {selectedEndpoint.requestBody && (
                <div className="details-block">
                  <div className="block-title">
                    <FileCode size={16} />
                    Request Body (JSON with Bean Validation):
                  </div>
                  <pre className="code-block">{selectedEndpoint.requestBody}</pre>
                </div>
              )}

              <div className="details-block">
                <div className="block-title">
                  <CheckCircle2 size={16} />
                  Standardized ApiResponse Envelope:
                </div>
                <pre className="code-block">{selectedEndpoint.sampleResponse}</pre>
              </div>

              <div className="details-actions">
                <button
                  className="btn-primary"
                  onClick={() => handleRunTest(selectedEndpoint)}
                  disabled={isTesting}
                >
                  <Play size={16} />
                  {isTesting ? 'Sending Request...' : 'Send Test Request'}
                </button>
              </div>

              {testOutput && (
                <div className="test-output-block">
                  <div className="block-title">
                    <Send size={16} />
                    Live Execution Output:
                  </div>
                  <pre className="output-code-block">{testOutput}</pre>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: NODE.JS VS SPRING BOOT COMPARISON */}
      {activeTab === 'comparison' && (
        <section className="api-comparison-section">
          <div className="api-section-header">
            <h2>Node.js (Express) vs Spring Boot (Java)</h2>
            <p>Mapping familiar Express backend concepts to modern enterprise Spring Boot architecture</p>
          </div>

          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Architectural Layer</th>
                  <th>Node.js (Express Backend)</th>
                  <th>Spring Boot (Java Backend)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Runtime Engine</strong></td>
                  <td>Node.js (V8 Single-threaded Event Loop)</td>
                  <td>Java Virtual Machine (JVM 17+ Multi-threaded)</td>
                </tr>
                <tr>
                  <td><strong>Package Manager</strong></td>
                  <td><code>npm</code> / <code>package.json</code></td>
                  <td><code>Maven</code> / <code>pom.xml</code></td>
                </tr>
                <tr>
                  <td><strong>Server Startup</strong></td>
                  <td><code>app.listen(5001)</code></td>
                  <td><code>SpringApplication.run(App.class)</code></td>
                </tr>
                <tr>
                  <td><strong>Routing & Controllers</strong></td>
                  <td><code>app.get('/api/posts', handler)</code></td>
                  <td><code>@RestController</code> + <code>@GetMapping('/api/v1/posts')</code></td>
                </tr>
                <tr>
                  <td><strong>Dependency Injection</strong></td>
                  <td>Manual function arguments / module exports</td>
                  <td>Spring IoC Container (Constructor DI, <code>@Service</code>)</td>
                </tr>
                <tr>
                  <td><strong>Input Validation</strong></td>
                  <td>Manual if-conditions / custom validators</td>
                  <td>Jakarta Bean Validation (<code>@NotBlank</code>, <code>@Size</code>, <code>@Valid</code>)</td>
                </tr>
                <tr>
                  <td><strong>Database Access</strong></td>
                  <td>Custom SQL / Prisma / In-memory Arrays</td>
                  <td>Spring Data JPA (<code>JpaRepository</code> + Hibernate ORM)</td>
                </tr>
                <tr>
                  <td><strong>Exception Handling</strong></td>
                  <td><code>try/catch</code> blocks in middleware</td>
                  <td>Centralized <code>@RestControllerAdvice</code> + <code>@ExceptionHandler</code></td>
                </tr>
                <tr>
                  <td><strong>API Documentation</strong></td>
                  <td>Manual Swagger JSON setup</td>
                  <td>Springdoc OpenAPI Swagger UI (<code>/swagger-ui.html</code>)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default memo(ApiDocsPage);
