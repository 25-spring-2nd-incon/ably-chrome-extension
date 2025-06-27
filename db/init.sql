CREATE DATABASE IF NOT EXISTS test_aste;

USE test_aste;

CREATE TABLE IF NOT EXISTS product_opinion (
    ID BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_ID BIGINT,
    sentence_ID INT,
    review_ID BIGINT,
    cleaned_sentence TEXT,
    aspect_span TEXT, 
    opinion_span TEXT,
    cleaned_opinion_span TEXT,
    sentiment VARCHAR(3),
    category VARCHAR(50)
);

-- CSV 파일 로드

LOAD DATA INFILE '/data/final_demo.csv'
INTO TABLE product_opinion
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(product_ID,sentence_ID,review_ID,cleaned_sentence,aspect_span,opinion_span,cleaned_opinion_span,sentiment,category);