package com.example.demo.api.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class DemoTokenFilterTest {

    private static final String TOKEN = "s3cret";

    /** Runs one request through the filter; returns the response and whether it reached the API. */
    private static Result call(String configured, String method, String path, String presented)
            throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        if (presented != null) {
            request.addHeader(DemoTokenFilter.HEADER, presented);
        }
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();
        new DemoTokenFilter(configured).doFilter(request, response, chain);
        return new Result(response, chain.getRequest() != null);
    }

    private record Result(MockHttpServletResponse response, boolean passed) {
    }

    @Test
    void allowsEverythingWhenNoTokenIsConfigured() throws Exception {
        assertTrue(call("", "DELETE", "/api/kafka/consume", null).passed());
        assertTrue(call("   ", "POST", "/api/kafka/produce", null).passed());
    }

    @Test
    void allowsRequestsCarryingTheToken() throws Exception {
        Result r = call(TOKEN, "POST", "/api/kafka/produce", TOKEN);
        assertTrue(r.passed());
        assertEquals(200, r.response().getStatus());
    }

    @Test
    void rejectsMissingToken() throws Exception {
        Result r = call(TOKEN, "DELETE", "/api/kafka/consume", null);
        assertFalse(r.passed());
        assertEquals(401, r.response().getStatus());
        assertEquals("{\"error\":\"Missing or invalid API token\"}", r.response().getContentAsString());
    }

    @Test
    void rejectsWrongOrPartialToken() throws Exception {
        assertEquals(401, call(TOKEN, "GET", "/api/kafka/messages", "wrong").response().getStatus());
        assertEquals(401, call(TOKEN, "GET", "/api/kafka/messages", "s3cre").response().getStatus());
        assertEquals(401, call(TOKEN, "GET", "/api/kafka/messages", "").response().getStatus());
    }

    @Test
    void leavesNonApiPathsAndPreflightOpen() throws Exception {
        assertTrue(call(TOKEN, "GET", "/actuator/health", null).passed());
        assertTrue(call(TOKEN, "GET", "/index.html", null).passed());
        assertTrue(call(TOKEN, "OPTIONS", "/api/kafka/produce", null).passed());
    }

    @Test
    void doesNotLeakTheTokenInTheRejection() throws Exception {
        MockHttpServletResponse response = call(TOKEN, "GET", "/api/kafka/messages", "nope").response();
        assertFalse(response.getContentAsString().contains(TOKEN));
    }
}
