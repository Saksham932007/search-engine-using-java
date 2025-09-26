-- Initialize the search engine database

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    url VARCHAR(1000) NOT NULL,
    file_path VARCHAR(1000),
    content_type VARCHAR(100),
    file_size BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    indexed_at TIMESTAMP,
    is_indexed BOOLEAN DEFAULT FALSE
);

-- Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
    id BIGSERIAL PRIMARY KEY,
    query VARCHAR(1000) NOT NULL,
    results_count INTEGER,
    search_time_ms BIGINT,
    user_ip VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_title ON documents(title);
CREATE INDEX IF NOT EXISTS idx_documents_url ON documents(url);
CREATE INDEX IF NOT EXISTS idx_documents_is_indexed ON documents(is_indexed);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at);

-- Insert sample data
INSERT INTO documents (title, content, url, content_type, is_indexed, indexed_at) VALUES
(
    'Introduction to Java Programming',
    'Java is a high-level, class-based, object-oriented programming language that is designed to have as few implementation dependencies as possible. It is a general-purpose programming language intended to let programmers write once, run anywhere (WORA), meaning that compiled Java code can run on all platforms that support Java without the need to recompile.',
    'https://docs.oracle.com/javase/tutorial/java/concepts/index.html',
    'text/html',
    true,
    CURRENT_TIMESTAMP
),
(
    'Spring Boot Framework Guide',
    'Spring Boot makes it easy to create stand-alone, production-grade Spring based Applications that you can just run. We take an opinionated view of the Spring platform and third-party libraries so you can get started with minimum fuss. Most Spring Boot applications need minimal Spring configuration.',
    'https://spring.io/projects/spring-boot',
    'text/html',
    true,
    CURRENT_TIMESTAMP
),
(
    'Apache Lucene Overview',
    'Apache Lucene is a free, open-source information retrieval software library, originally written entirely in Java by Doug Cutting. Supported by the Apache Software Foundation, it is suitable for nearly any application that requires full-text indexing and searching capability.',
    'https://lucene.apache.org/core/',
    'text/html',
    true,
    CURRENT_TIMESTAMP
),
(
    'Database Design Principles',
    'Database design is the organization of data according to a database model. The designer determines what data must be stored and how the data elements interrelate. With this information, they can begin to fit the data to the database model. Database design involves classifying data and identifying interrelationships.',
    'https://en.wikipedia.org/wiki/Database_design',
    'text/html',
    true,
    CURRENT_TIMESTAMP
),
(
    'RESTful Web Services',
    'REST (Representational State Transfer) is an architectural style for providing standards between computer systems on the web, making it easier for systems to communicate with each other. REST-compliant systems, often called RESTful systems, are characterized by how they are stateless and separate the concerns of client and server.',
    'https://restfulapi.net/',
    'text/html',
    true,
    CURRENT_TIMESTAMP
);

-- Insert sample search history
INSERT INTO search_history (query, results_count, search_time_ms) VALUES
('java programming', 15, 45),
('spring boot', 8, 32),
('database design', 12, 28),
('web services', 6, 41),
('lucene search', 4, 38),
('rest api', 9, 35),
('programming tutorial', 18, 52);

COMMIT;