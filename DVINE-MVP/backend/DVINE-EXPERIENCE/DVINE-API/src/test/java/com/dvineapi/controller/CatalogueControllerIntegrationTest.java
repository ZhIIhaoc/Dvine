package com.dvineapi.controller;

import com.dvinedao.domain.Catalogue;
import com.dvinedao.domain.User;
import com.dvinedao.mapper.CatalogueMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CatalogueControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CatalogueMapper catalogueMapper;

    @Autowired
    private ObjectMapper objectMapper;

    private Catalogue makeReq() {
        Catalogue c = new Catalogue();
        c.setTitle("European Escapes");
        c.setDescription("Dream trips around Europe.");
        c.setCoverImage("https://your-cdn.com/cover1.jpg");
        return c;
    }
    private String loginAndGetToken(String email) throws Exception {
        User loginUser = new User();
        loginUser.setEmail(email);
        loginUser.setPassword("1234"); // plain‐text password

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
    private Catalogue makeCatalogue(long creatorId, int type) {
        Catalogue c = new Catalogue();
        c.setTitle("Test Cat");
        c.setDescription("Desc");
        c.setType(type);                  // 现在可自由指定 0 或 1
        c.setCreatorId(creatorId);
        c.setCoverImage("https://cdn/test.jpg");
        catalogueMapper.createCatalogue(c);
        return c;
    }

    @Test
    void list_shouldReturn200AndSeededCataloguesUsingMapper() throws Exception {

        // 2) 插入两条 Catalogue
        // 第一条：creatorId = 5 (bigOwner)
        Catalogue c1 = new Catalogue();
        c1.setTitle("European Escapes");
        c1.setDescription("Dream trips around Europe.");
        c1.setType(0);
        c1.setCreatorId(5L);
        c1.setCoverImage("https://your-cdn.com/cover1.jpg");
        catalogueMapper.createCatalogue(c1);

        // 第二条：creatorId = 4 (managerMan)
        Catalogue c2 = new Catalogue();
        c2.setTitle("Australia");
        c2.setDescription("Dream trips around Europe.");
        c2.setType(1);
        c2.setCreatorId(4L);
        c2.setCoverImage("https://your-cdn.com/cover1.jpg");
        catalogueMapper.createCatalogue(c2);

        mockMvc.perform(get("/catalogues/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                // 现在 data[0] 应该是 c1
                .andExpect(jsonPath("$.data[1].catalogueId").isNumber())
                .andExpect(jsonPath("$.data[1].title").value("European Escapes"))
                .andExpect(jsonPath("$.data[1].type").value(0))
                .andExpect(jsonPath("$.data[1].description").value("Dream trips around Europe."))
                .andExpect(jsonPath("$.data[1].coverImage").value("https://your-cdn.com/cover1.jpg"))
                .andExpect(jsonPath("$.data[1].creatorId").value(5))
                .andExpect(jsonPath("$.data[1].creatorNickName").value("bigOwner"))
                // data[1] = c2 ("Australia")
                .andExpect(jsonPath("$.data[0].catalogueId").isNumber())
                .andExpect(jsonPath("$.data[0].title").value("Australia"))
                .andExpect(jsonPath("$.data[0].type").value(1))
                .andExpect(jsonPath("$.data[0].description").value("Dream trips around Europe."))
                .andExpect(jsonPath("$.data[0].coverImage").value("https://your-cdn.com/cover1.jpg"))
                .andExpect(jsonPath("$.data[0].creatorId").value(4))
                .andExpect(jsonPath("$.data[0].creatorNickName").value("managerMan"));
    }

    @Test
    void getById_success_shouldReturn200() throws Exception {
        // 1) 插入一条 Catalogue，creatorId = 5 (bigOwner)
        Catalogue c = new Catalogue();
        c.setTitle("Australian Adventures");
        c.setDescription("Explore the wildest tours in Australia!");
        c.setType(0);
        c.setCreatorId(4L);
        c.setCoverImage("https://your-cdn.com/cover1.jpg");
        catalogueMapper.createCatalogue(c);

        mockMvc.perform(get("/catalogues/{catalogueId}", c.getCatalogueId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data.catalogueId").value(c.getCatalogueId().intValue()))
                .andExpect(jsonPath("$.data.title").value("Australian Adventures"))
                .andExpect(jsonPath("$.data.description").value("Explore the wildest tours in Australia!"))
                .andExpect(jsonPath("$.data.type").value(0))
                .andExpect(jsonPath("$.data.coverImage").value("https://your-cdn.com/cover1.jpg"))
                .andExpect(jsonPath("$.data.creatorId").value(4))
                .andExpect(jsonPath("$.data.creatorNickName").value("managerMan"));
    }
    @Test
    void getById_notFound_shouldReturn404() throws Exception {
        mockMvc.perform(get("/catalogues/{catalogueId}", 99999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Catalogue not found"));
    }
    @Test
    void createCatalogue_asPartner_shouldReturn201() throws Exception {
        // 1) Log in as Partner
        User loginUser = new User();
        loginUser.setEmail("i_am_partner@example.com");
        loginUser.setPassword("1234");

        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andReturn();

        String loginJson   = loginResult.getResponse().getContentAsString();
        JsonNode dataNode  = objectMapper.readTree(loginJson).path("data");
        String accessToken = dataNode.get("accessToken").asText();

        // 2) Build the Catalogue payload
        Catalogue catalogue = new Catalogue();
        catalogue.setTitle("Partner's New Catalogue");
        catalogue.setDescription("Only a Partner may create this catalogue");
        catalogue.setType(1);
        catalogue.setCoverImage("https://your-cdn.com/cover.png");

        // 3) Create catalogue with Partner's token
        mockMvc.perform(post("/catalogues")
                        .header("Authorization", accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(catalogue)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }
    @Test
    void createCatalogue_asOwner_shouldReturn201() throws Exception {
        // 1) Log in as Owner
        User loginUser = new User();
        loginUser.setEmail("i_am_owner@example.com");
        loginUser.setPassword("1234");

        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andReturn();

        String loginJson   = loginResult.getResponse().getContentAsString();
        JsonNode dataNode  = objectMapper.readTree(loginJson).path("data");
        String accessToken = dataNode.get("accessToken").asText();

        // 2) Build the Catalogue payload
        Catalogue catalogue = new Catalogue();
        catalogue.setTitle("Owner's Catalogue");
        catalogue.setDescription("Only an Owner may create this catalogue");
        catalogue.setType(0);
        catalogue.setCoverImage("https://your-cdn.com/cover.png");

        // 3) Create catalogue with Owner's token
        mockMvc.perform(post("/catalogues")
                        .header("Authorization", accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(catalogue)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }
    @Test
    void createCatalogue_asPremiumMember_shouldReturn403() throws Exception {
        // 1) Log in as Premium Member
        User loginUser = new User();
        loginUser.setEmail("i_am_premium@example.com");
        loginUser.setPassword("1234");

        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andReturn();

        String loginJson   = loginResult.getResponse().getContentAsString();
        JsonNode dataNode  = objectMapper.readTree(loginJson).path("data");
        String accessToken = dataNode.get("accessToken").asText();

        // 2) Build the Catalogue payload
        Catalogue catalogue = new Catalogue();
        catalogue.setTitle("Premium Member Catalogue");
        catalogue.setDescription("Premium members are not allowed to create catalogues");
        catalogue.setType(1);
        catalogue.setCoverImage("https://your-cdn.com/cover.png");

        // 3) Attempt creation with Premium Member's token → Forbidden
        mockMvc.perform(post("/catalogues")
                        .header("Authorization", accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(catalogue)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("You don't have permission to modify this catalogue"));
    }


    @Test
    void createCatalogue_unauthenticated_shouldReturn401() throws Exception {
        // Build the Catalogue payload without logging in
        Catalogue catalogue = new Catalogue();
        catalogue.setTitle("Anonymous Catalogue");
        catalogue.setDescription("This should fail due to missing authentication");
        catalogue.setType(0);
        catalogue.setCoverImage("https://your-cdn.com/cover.png");

        // Attempt creation with no token → Unauthorized
        mockMvc.perform(post("/catalogues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(catalogue)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }
    @Test
    void updateCatalogue_asOwner_shouldReturn200() throws Exception {
        // insert a catalogue created by manager (userId=4)
        Catalogue existing = new Catalogue();
        existing.setTitle("Original Title");
        existing.setDescription("Original Description");
        existing.setType(0);
        existing.setCreatorId(4L);
        existing.setCoverImage("https://your-cdn.com/original.jpg");
        catalogueMapper.createCatalogue(existing);

        String token = loginAndGetToken("i_am_owner@example.com");

        // prepare update payload
        Catalogue update = new Catalogue();
        update.setCatalogueId(existing.getCatalogueId());
        update.setTitle("Updated by Owner");
        update.setDescription("Owner can update any catalogue");
        update.setCoverImage("https://your-cdn.com/updated-by-owner.jpg");

        mockMvc.perform(put("/catalogues")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }
    @Test
    void updateCatalogue_asManager_shouldReturn200() throws Exception {
        Catalogue existing = new Catalogue();
        existing.setTitle("Original Title");
        existing.setDescription("Original Description");
        existing.setType(0);
        existing.setCreatorId(3L);
        existing.setCoverImage("https://your-cdn.com/original.jpg");
        catalogueMapper.createCatalogue(existing);

        String token = loginAndGetToken("i_am_manager@example.com");

        Catalogue update = new Catalogue();
        update.setCatalogueId(existing.getCatalogueId());
        update.setTitle("Updated by Manager");
        update.setDescription("Manager can update any catalogue");
        update.setCoverImage("https://your-cdn.com/updated-by-manager.jpg");

        mockMvc.perform(put("/catalogues")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }
    @Test
    void updateCatalogue_asPartner_modifyOthers_shouldReturn403() throws Exception {
        // insert a catalogue created by manager (userId=4)
        Catalogue existing = new Catalogue();
        existing.setTitle("Manager's Catalogue");
        existing.setDescription("Partner should not touch");
        existing.setType(1);
        existing.setCreatorId(4L);
        existing.setCoverImage("https://your-cdn.com/original.jpg");
        catalogueMapper.createCatalogue(existing);

        String token = loginAndGetToken("i_am_partner@example.com");

        Catalogue update = new Catalogue();
        update.setCatalogueId(existing.getCatalogueId());
        update.setTitle("Partner Tries Update");
        update.setDescription("Should be forbidden");
        update.setCoverImage("https://your-cdn.com/attempt.jpg");

        mockMvc.perform(put("/catalogues")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg")
                        .value("Partner can only modify catalogues created by themselves"));
    }
    @Test
    void updateCatalogue_asPremiumMember_shouldReturn403() throws Exception {
        // insert any catalogue
        Catalogue existing = new Catalogue();
        existing.setTitle("Some Catalogue");
        existing.setDescription("Premium cannot update");
        existing.setType(0);
        existing.setCreatorId(5L);
        existing.setCoverImage("https://your-cdn.com/original.jpg");
        catalogueMapper.createCatalogue(existing);

        String token = loginAndGetToken("i_am_premium@example.com");

        Catalogue update = new Catalogue();
        update.setCatalogueId(existing.getCatalogueId());
        update.setTitle("Premium Attempt");
        update.setDescription("Should be forbidden");
        update.setCoverImage("https://your-cdn.com/attempt.jpg");

        mockMvc.perform(put("/catalogues")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg")
                        .value("You don't have permission to modify this catalogue"));
    }
    @Test
    void updateCatalogue_unauthenticated_shouldReturn401() throws Exception {
        Catalogue update = new Catalogue();
        update.setCatalogueId(3L);
        update.setTitle("No Auth");
        update.setDescription("Expect unauthorized");
        update.setCoverImage("https://your-cdn.com/noauth.jpg");

        mockMvc.perform(put("/catalogues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }
    @Test
    void updateCatalogue_notFound_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_manager@example.com");

        Catalogue update = new Catalogue();
        update.setCatalogueId(99999L);
        update.setTitle("Not Found");
        update.setDescription("This ID does not exist");
        update.setCoverImage("https://your-cdn.com/notfound.jpg");

        mockMvc.perform(put("/catalogues")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Catalogue not found"));
    }
    @Test
    void deleteCatalogue_asOwner_shouldReturn200() throws Exception {
        // Owner 删除官方目录
        Catalogue c = makeCatalogue(5L, 0);
        String token = loginAndGetToken("i_am_owner@example.com");
        mockMvc.perform(delete("/catalogues")
                        .param("catalogueId", c.getCatalogueId().toString())
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }
    @Test
    void deleteCatalogue_unauthenticated_shouldReturn401() throws Exception {
        // 用 makeCatalogue(…) 而不是 makeReq()
        Catalogue c = makeCatalogue(5L, 0);
        // 不带 token 调用 → 401
        mockMvc.perform(delete("/catalogues")
                        .param("catalogueId", c.getCatalogueId().toString()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }
    @Test
    void deleteCatalogue_asPartnerNotOwner_shouldReturn403() throws Exception {
        // 1) 插入一个 catalogue，它的 creatorId 不是 partner 自己
        Catalogue c = makeCatalogue(4L, 1);

        // 2) 以 Partner 身份登录拿到 token
        String token = loginAndGetToken("i_am_partner@example.com");

        // 3) 发删除请求 → 403 + 特定错误信息
        mockMvc.perform(delete("/catalogues")
                        .param("catalogueId", c.getCatalogueId().toString())
                        .header("Authorization", token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg")
                        .value("Partner can only modify catalogues created by themselves"));
    }
    @Test
    void deleteCatalogue_asPremiumMember_shouldReturn403() throws Exception {
        // 1) 插入一个 catalogue（creatorId 随意）
        Catalogue c = makeCatalogue(5L, 0);

        // 2) 用 Premium Member 登录拿 token
        String token = loginAndGetToken("i_am_premium@example.com");

        // 3) 发删除请求 → 403 + 固定错误提示
        mockMvc.perform(delete("/catalogues")
                        .param("catalogueId", c.getCatalogueId().toString())
                        .header("Authorization", token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg")
                        .isString());
    }




}
