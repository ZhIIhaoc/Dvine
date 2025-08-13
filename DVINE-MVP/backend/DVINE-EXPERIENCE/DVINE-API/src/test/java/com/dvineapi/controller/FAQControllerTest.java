package com.dvineapi.controller;

import com.dvinedao.domain.Faq;
import com.dvinedao.domain.User;
import com.dvinedao.mapper.FaqMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class FAQControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FaqMapper faqMapper;

    private String loginAndGetToken(String email) throws Exception {
        User loginUser = new User();
        loginUser.setEmail(email);
        loginUser.setPassword("1234");

        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andReturn();

        String loginJson = loginResult.getResponse().getContentAsString();
        JsonNode dataNode = objectMapper.readTree(loginJson).path("data");
        return dataNode.get("accessToken").asText();
    }

    private Faq createTestFaq() {
        Faq faq = new Faq();
        faq.setQuestion("What is DVINE?");
        faq.setAnswer("DVINE is a comprehensive tour experience management platform.");
        faqMapper.createFaq(faq);
        return faq;
    }

    // GET /faqs - Get all FAQs (Public access)
    @Test
    void findAllFaqs_shouldReturn200() throws Exception {
        // Create test FAQs
        Faq faq1 = createTestFaq();
        Faq faq2 = new Faq();
        faq2.setQuestion("How do I book a tour?");
        faq2.setAnswer("You can browse our tours and follow the booking process.");
        faqMapper.createFaq(faq2);

        mockMvc.perform(get("/faqs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].faqId").isNumber())
                .andExpect(jsonPath("$.data[0].question").isString())
                .andExpect(jsonPath("$.data[0].answer").isString());
    }

    // GET /faqs/{faqId} - Get FAQ by ID (Public access)
    @Test
    void findFaqById_success_shouldReturn200() throws Exception {
        Faq faq = createTestFaq();

        mockMvc.perform(get("/faqs/{faqId}", faq.getFaqId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data.faqId").value(faq.getFaqId().intValue()))
                .andExpect(jsonPath("$.data.question").value("What is DVINE?"))
                .andExpect(jsonPath("$.data.answer").value("DVINE is a comprehensive tour experience management platform."));
    }

    @Test
    void findFaqById_notFound_shouldReturn404() throws Exception {
        mockMvc.perform(get("/faqs/{faqId}", 99999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("FAQ not found"));
    }

    // POST /faqs - Create new FAQ (Manager permission required)
    @Test
    void createFaq_asManager_shouldReturn201() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");

        Faq faq = new Faq();
        faq.setQuestion("What payment methods do you accept?");
        faq.setAnswer("We accept all major credit cards, PayPal, and bank transfers.");

        mockMvc.perform(post("/faqs")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(faq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }

    @Test
    void createFaq_unauthorized_shouldReturn401() throws Exception {
        Faq faq = new Faq();
        faq.setQuestion("Test Question");
        faq.setAnswer("Test Answer");

        mockMvc.perform(post("/faqs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(faq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    @Test
    void createFaq_asPartner_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_partner@example.com");

        Faq faq = new Faq();
        faq.setQuestion("Test Question");
        faq.setAnswer("Test Answer");

        mockMvc.perform(post("/faqs")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(faq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You don't have permission to access this resource. Required level: Manager"));
    }

    @Test
    void createFaq_asPremiumMember_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");

        Faq faq = new Faq();
        faq.setQuestion("Test Question");
        faq.setAnswer("Test Answer");

        mockMvc.perform(post("/faqs")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(faq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You don't have permission to access this resource. Required level: Manager"));
    }

    // PUT /faqs - Update FAQ (Manager permission required)
    @Test
    void updateFaq_asManager_shouldReturn200() throws Exception {
        Faq existingFaq = createTestFaq();
        String token = loginAndGetToken("i_am_manager@example.com");

        Faq updateFaq = new Faq();
        updateFaq.setFaqId(existingFaq.getFaqId());
        updateFaq.setQuestion("What is DVINE Experience Platform?");
        updateFaq.setAnswer("DVINE is a comprehensive tour experience management platform that connects travelers worldwide.");

        mockMvc.perform(put("/faqs")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateFaq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }

    @Test
    void updateFaq_notFound_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");

        Faq updateFaq = new Faq();
        updateFaq.setFaqId(99999L);
        updateFaq.setQuestion("Non-existent FAQ");
        updateFaq.setAnswer("This should not work");

        mockMvc.perform(put("/faqs")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateFaq)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("FAQ not found"));
    }

    @Test
    void updateFaq_unauthorized_shouldReturn401() throws Exception {
        Faq faq = createTestFaq();

        Faq updateFaq = new Faq();
        updateFaq.setFaqId(faq.getFaqId());
        updateFaq.setQuestion("Updated Question");
        updateFaq.setAnswer("Updated Answer");

        mockMvc.perform(put("/faqs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateFaq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    @Test
    void updateFaq_asPartner_shouldReturn403() throws Exception {
        Faq existingFaq = createTestFaq();
        String token = loginAndGetToken("i_am_partner@example.com");

        Faq updateFaq = new Faq();
        updateFaq.setFaqId(existingFaq.getFaqId());
        updateFaq.setQuestion("Updated Question");
        updateFaq.setAnswer("Updated Answer");

        mockMvc.perform(put("/faqs")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateFaq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You don't have permission to access this resource. Required level: Manager"));
    }

    // DELETE /faqs/{faqId} - Delete FAQ (Manager permission required)
    @Test
    void deleteFaq_asManager_shouldReturn200() throws Exception {
        Faq faq = createTestFaq();
        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(delete("/faqs/{faqId}", faq.getFaqId())
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }

    @Test
    void deleteFaq_notFound_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");

        mockMvc.perform(delete("/faqs/{faqId}", 99999L)
                        .header("Authorization", token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("FAQ not found"));
    }

    @Test
    void deleteFaq_unauthorized_shouldReturn401() throws Exception {
        Faq faq = createTestFaq();

        mockMvc.perform(delete("/faqs/{faqId}", faq.getFaqId()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }

    @Test
    void deleteFaq_asPartner_shouldReturn403() throws Exception {
        Faq faq = createTestFaq();
        String token = loginAndGetToken("i_am_partner@example.com");

        mockMvc.perform(delete("/faqs/{faqId}", faq.getFaqId())
                        .header("Authorization", token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You don't have permission to access this resource. Required level: Manager"));
    }

    @Test
    void deleteFaq_asPremiumMember_shouldReturn403() throws Exception {
        Faq faq = createTestFaq();
        String token = loginAndGetToken("i_am_premium@example.com");

        mockMvc.perform(delete("/faqs/{faqId}", faq.getFaqId())
                        .header("Authorization", token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You don't have permission to access this resource. Required level: Manager"));
    }

    @Test
    void deleteFaq_asOwner_shouldReturn200() throws Exception {
        Faq faq = createTestFaq();
        String token = loginAndGetToken("i_am_owner@example.com");

        mockMvc.perform(delete("/faqs/{faqId}", faq.getFaqId())
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }
}