package com.dvineapi.controller;

import com.dvinedao.domain.Image;
import com.dvinedao.domain.Tour;
import com.dvinedao.domain.Catalogue;
import com.dvinedao.domain.User;
import com.dvinedao.mapper.CatalogueMapper;
import com.dvinedao.mapper.ImageMapper;
import com.dvinedao.mapper.TourMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional  // 保证每个测试方法结束后自动回滚，表保持干净
public class TourControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TourMapper tourMapper;
    @Autowired
    private CatalogueMapper catalogueMapper;
    @Autowired
    private ImageMapper imageMapper;
    @Autowired
    private ObjectMapper objectMapper;

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

    private Catalogue catalogue;
    private Tour tour1;
    private Tour tour2;

    @BeforeEach
    public void setup() {
        // 1) 建一个父级 Catalogue
        Catalogue c = new Catalogue();
        c.setTitle("Test Catalogue");
        c.setDescription("Catalogue Desc");
        c.setCoverImage("https://cdn/catalogue.jpg");
        catalogueMapper.createCatalogue(c);
        this.catalogue = c;

        // 2) 插入两条固定的 Tour
        this.tour1 = makeTour(
                c.getCatalogueId(),
                "Sydney Coastal Walk",
                "Sydney, Australia",
                "See the cliffs and beaches.",
                129.99,
                "https://your-cdn.com/tour101.jpg"
        );
        this.tour2 = makeTour(
                c.getCatalogueId(),
                "Outback Adventure",
                "Northern Territory, Australia",
                "Explore the heart of Australia.",
                499.99,
                "https://your-cdn.com/tour102.jpg"
        );

    }

    private Tour makeTour(Long catalogueId,
                          String title,
                          String destination,
                          String description,
                          double price,
                          String primaryImageUrl) {
        Tour t = new Tour();
        t.setCatalogueId(catalogueId);
        t.setTitle(title);
        t.setDestination(destination);
        t.setDescription(description);
        t.setPrice(price);
        t.setPrimaryImageUrl(primaryImageUrl);
        // 插入后 t.getTourId() 会被回填
        tourMapper.createTour(t);
        makeImage(t.getTourId(), primaryImageUrl, true);
        makeImage(t.getTourId(), primaryImageUrl.replace(".jpg", "_2.jpg"), false);
        return t;
    }
    private Image makeImage(Long tourId, String imageUrl, Boolean isPrimary) {
        Image image = new Image();
        image.setTourId(tourId);
        image.setImageUrl(imageUrl);
        image.setIsPrimary(isPrimary);
        // 插入后 image.getImageId() 会被回填
        imageMapper.createImages(List.of(image));
        return image;
    }

    @Test
    public void search_shouldReturnExactlyThoseTwoTours() throws Exception {
        mockMvc.perform(get("/tours")
                        // <- 关键：加上 catalogueId 参数
                        .param("catalogueId", catalogue.getCatalogueId().toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                .andExpect(jsonPath("$.data", hasSize(2)))
                // 校验第一条
                .andExpect(jsonPath("$.data[0].tourId").value(tour1.getTourId()))
                .andExpect(jsonPath("$.data[0].title").value("Sydney Coastal Walk"))
                .andExpect(jsonPath("$.data[0].destination").value("Sydney, Australia"))
                .andExpect(jsonPath("$.data[0].description").value("See the cliffs and beaches."))
                .andExpect(jsonPath("$.data[0].price").value(129.99))
                .andExpect(jsonPath("$.data[0].primaryImageUrl")
                                .isString())
                // 校验第二条
                .andExpect(jsonPath("$.data[1].tourId").value(tour2.getTourId()))
                .andExpect(jsonPath("$.data[1].title").value("Outback Adventure"))
                .andExpect(jsonPath("$.data[1].destination").value("Northern Territory, Australia"))
                .andExpect(jsonPath("$.data[1].description").value("Explore the heart of Australia."))
                .andExpect(jsonPath("$.data[1].price").value(499.99))
                .andExpect(jsonPath("$.data[1].primaryImageUrl")
                        .isString());
    }
    @Test
    public void search_withNonexistentCatalogueId_shouldReturn404() throws Exception {
        mockMvc.perform(get("/tours")
                        .param("catalogueId", "99999")
                        .contentType(MediaType.APPLICATION_JSON))
                // 期望 404 Not Found
                .andExpect(status().isNotFound())
                // 返回体里 code = 1
                .andExpect(jsonPath("$.code").value(1))
                // msg 为 "Tour not found"
                .andExpect(jsonPath("$.msg").value("Tour not found"));
    }
    /**
     * GET /tours/{tourId} —— 不存在该 tourId 时，返回 404 + { code:1, msg:"Tour not found" }
     */
    @Test
    public void getById_notFound_shouldReturn404() throws Exception {
        mockMvc.perform(get("/tours/{tourId}", 99999L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Tour not found"));
    }

    @Test
    public void getById_success_shouldReturnTourDetailWithImages() throws Exception {
        mockMvc.perform(get("/tours/{tourId}", tour1.getTourId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"))
                // 注意这里要用 $.data.xxx
                .andExpect(jsonPath("$.data.tourId").value(tour1.getTourId().intValue()))
                .andExpect(jsonPath("$.data.catalogueId").value(catalogue.getCatalogueId().intValue()))
                .andExpect(jsonPath("$.data.title").value("Sydney Coastal Walk"))
                .andExpect(jsonPath("$.data.destination").value("Sydney, Australia"))
                .andExpect(jsonPath("$.data.description").value("See the cliffs and beaches."))
                .andExpect(jsonPath("$.data.price").value(129.99))
                // images 是长度为 2 的数组
                .andExpect(jsonPath("$.data.images", hasSize(2)))
                .andExpect(jsonPath("$.data.images[0]").isString())
                .andExpect(jsonPath("$.data.images[1]").isString());
    }
    @Test
    public void createTour_asPartner_shouldReturn201() throws Exception {
        // 1) 以 partner 身份登录（catalogue.creatorId == 4）
        String token = loginAndGetToken("i_am_partner@example.com");

        // 2) 构造一个 Tour 对象作为请求体6
        Tour req = new Tour();
        req.setCatalogueId(catalogue.getCatalogueId());
        req.setTitle("Great Barrier Reef Adventure");
        req.setDestination("Cairns, Australia");
        req.setDescription("Explore the underwater wonders of the reef.");
        req.setPrice(299.99);
        req.setPrimaryImageUrl("https://your-cdn.com/reef.jpg");
        // 记得给 images 字段也赋值
        req.setImages(List.of(
                "https://your-cdn.com/tour101_1.jpg",
                "https://your-cdn.com/tour101_2.jpg"
        ));

        // 3) 执行请求并断言 - Partners can now create tours
        mockMvc.perform(post("/tours")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }
    @Test
    public void createTour_success_shouldReturn201_asAdminOwner() throws Exception {
        // 1) Login as Owner (ADMIN)
        String token = loginAndGetToken("i_am_owner@example.com");

        // 2) 构造请求体，注意 catalogue.creatorId == 4L（BeforeEach 中那个 Catalogue）
        Tour req = new Tour();
        req.setCatalogueId(catalogue.getCatalogueId());
        req.setTitle("Great Barrier Reef Adventure");
        req.setDestination("Cairns, Australia");
        req.setDescription("Explore the underwater wonders of the reef.");
        req.setPrice(299.99);
        req.setPrimaryImageUrl("https://your-cdn.com/reef.jpg");
        req.setImages(List.of(
                "https://your-cdn.com/tour101_1.jpg",
                "https://your-cdn.com/tour101_2.jpg"
        ));

        // 3) 执行请求并断言 Created
        mockMvc.perform(post("/tours")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }
    @Test
    public void createTour_unauthenticated_shouldReturn401() throws Exception {
        // 构造一个合法的请求体（不关心内容，因为会先被拦截为 401）
        Tour req = new Tour();
        req.setCatalogueId(catalogue.getCatalogueId());
        req.setTitle("Reef Adventure");
        req.setDestination("Cairns, Australia");
        req.setDescription("Underwater wonders.");
        req.setPrice(299.99);
        req.setPrimaryImageUrl("https://your-cdn.com/reef.jpg");
        req.setImages(List.of("https://your-cdn.com/tour101_1.jpg"));

        mockMvc.perform(post("/tours")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }
    /**
     * POST /tours — 登录为 Premium Member，因 @PermissionCheck 触发，返回 403 +
     * {code:1, msg:"You don't have permission to access this resource"}
     */
    @Test
    public void createTour_shouldReturn403_asPremiumMember() throws Exception {
        // 以 premium member 身份登录
        String token = loginAndGetToken("i_am_premium@example.com");

        // 构造请求体
        Tour req = new Tour();
        req.setCatalogueId(catalogue.getCatalogueId());
        req.setTitle("Reef Adventure");
        req.setDestination("Cairns, Australia");
        req.setDescription("Underwater wonders.");
        req.setPrice(299.99);
        req.setPrimaryImageUrl("https://your-cdn.com/reef.jpg");
        req.setImages(List.of("https://your-cdn.com/tour101_1.jpg"));

        mockMvc.perform(post("/tours")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg")
                        .isString());
    }
    @Test
    public void createTour_shouldReturn404_forNonexistentCatalogue() throws Exception {
        // 以 Owner（ADMIN）身份登录
        String token = loginAndGetToken("i_am_owner@example.com");

        // 构造一个指向不存在 catalogeId 的请求体
        Tour req = new Tour();
        req.setCatalogueId(99999L);
        req.setTitle("Reef Adventure");
        req.setDestination("Cairns, Australia");
        req.setDescription("Underwater wonders.");
        req.setPrice(299.99);
        req.setPrimaryImageUrl("https://your-cdn.com/reef.jpg");
        req.setImages(List.of("https://your-cdn.com/tour101_1.jpg"));

        mockMvc.perform(post("/tours")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Catalogue not found"));
    }
    @Test
    public void deleteTour_unauthenticated_shouldReturn401() throws Exception {
        // 无 token
        mockMvc.perform(delete("/tours")
                        .param("tourId", tour1.getTourId().toString()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }
    @Test
    public void deleteTour_shouldReturn403_asPremiumMember() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");

        mockMvc.perform(delete("/tours")
                        .header("Authorization", token)
                        .param("tourId", tour1.getTourId().toString()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg")
                        .isString());
    }
    @Test
    public void deleteTour_shouldReturn403_asPartnerOnOthersCatalogue() throws Exception {
        String token = loginAndGetToken("i_am_partner@example.com");

        mockMvc.perform(delete("/tours")
                        .header("Authorization", token)
                        .param("tourId", tour1.getTourId().toString()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg")
                        .value("Partner can only modify catalogues created by themselves"));
    }
    @Test
    public void deleteTour_shouldReturn404_forNonexistentTour() throws Exception {
        // 以 Owner（ADMIN）身份登录
        String token = loginAndGetToken("i_am_owner@example.com");

        mockMvc.perform(delete("/tours")
                        .header("Authorization", token)
                        .param("tourId", "99999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Tour not found"));
    }
    @Test
    public void deleteTour_success_shouldReturn200() throws Exception {
        // 以 Owner 身份登录
        String token = loginAndGetToken("i_am_owner@example.com");

        // 执行删除 tour1
        mockMvc.perform(delete("/tours")
                        .header("Authorization", token)
                        .param("tourId", tour1.getTourId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }
    @Test
    public void updateTour_success_shouldReturn200() throws Exception {
        // 以 Owner 身份登录
        String token = loginAndGetToken("i_am_owner@example.com");

        // 构造请求体
        Tour req = new Tour();
        req.setTourId(tour1.getTourId());
        req.setCatalogueId(catalogue.getCatalogueId());
        req.setTitle("Updated Title");
        req.setDestination("Updated Destination");
        req.setDescription("Updated Description");
        req.setPrice(199.99);
        req.setPrimaryImageUrl("https://your-cdn.com/updated.jpg");
        req.setImages(List.of(
                "https://your-cdn.com/updated1.jpg",
                "https://your-cdn.com/updated2.jpg"
        ));

        mockMvc.perform(put("/tours")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }
    @Test
    public void updateTour_unauthenticated_shouldReturn401() throws Exception {
        // 不带 Authorization
        Tour req = new Tour();
        req.setTourId(tour1.getTourId());
        req.setCatalogueId(catalogue.getCatalogueId());
        req.setTitle("Whatever");

        mockMvc.perform(put("/tours")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("User not logged in"));
    }
    @Test
    public void updateTour_asPremiumMember_shouldReturn403() throws Exception {
        String token = loginAndGetToken("i_am_premium@example.com");

        Tour req = new Tour();
        req.setTourId(tour1.getTourId());
        req.setCatalogueId(catalogue.getCatalogueId());
        req.setTitle("Nope");

        mockMvc.perform(put("/tours")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").isString());
    }
    @Test
    public void updateTour_asPartner_shouldReturn200() throws Exception {
        // 先造一个别人的 Catalogue + Tour
        String token = loginAndGetToken("i_am_partner@example.com");

        Tour req = new Tour();
        req.setTourId(tour1.getTourId());
        req.setCatalogueId(catalogue.getCatalogueId());
        req.setTitle("Updated by Partner");

        mockMvc.perform(put("/tours")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("success"));
    }
    @Test
    public void updateTour_notFoundCatalogue_shouldReturn404() throws Exception {
        String token = loginAndGetToken("i_am_owner@example.com");

        Tour req = new Tour();
        req.setTourId(tour1.getTourId());
        req.setCatalogueId(99999L);
        req.setTitle("Won't work");

        mockMvc.perform(put("/tours")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(1))
                .andExpect(jsonPath("$.msg").value("Catalogue does not exist"));
    }






}
