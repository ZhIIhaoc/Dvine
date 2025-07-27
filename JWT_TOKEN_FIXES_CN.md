# JWT Token 处理修复 - DVINE-MVP 项目

## 概述

本文档详细说明了为解决 DVINE-MVP 前端应用程序中的 JWT token 过期问题并改善整体认证系统而实施的全面修复。

## 问题总结

### 初始问题
1. **Token 过期问题**: 2小时后，用户仪表板和账户设置显示"加载中"无限期
2. **Token 处理不一致**: 不同组件使用不同的 API 调用方法
3. **手动 Token 管理**: 每个组件必须手动处理 token 刷新
4. **访客用户兼容性**: Token 处理需要同时适用于已认证和访客用户

### 根本原因
- JWT 访问令牌在2小时后过期
- 前端组件使用直接的 `fetch` 调用，没有自动 token 刷新
- 没有集中化的 token 管理系统
- 后端对空结果的异常导致意外重定向

## 实施的解决方案

### 1. 全局 Fetch 拦截器 (`main.jsx`)

**文件**: `DVINE-MVP/frontend/src/main.jsx`

**目的**: 集中化 JWT token 注入和自动刷新

**实现**:
```javascript
// 全局 fetch 重写用于 JWT token 处理
const originalFetch = window.fetch;
window.fetch = async (input, init = {}) => {
    let token = localStorage.getItem('accessToken');
    let refreshToken = localStorage.getItem('refreshToken');
    
    // 克隆 headers 以避免修改输入
    let headers = { ...(init.headers || {}) };
    if (token) {
        headers['Authorization'] = token;
    }
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    
    const fetchInit = { ...init, headers };
    let response = await originalFetch(input, fetchInit);

    // 如果是 401 且有 token，尝试刷新
    if (response.status === 401 && token) {
        console.log('401 未授权。尝试刷新 token...');
        const refreshResponse = await originalFetch('http://localhost:8080/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });

        if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.code === 0 && refreshData.data) {
                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshData.data;
                localStorage.setItem('accessToken', newAccessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                console.log('Token 刷新成功。重试原始请求...');
                
                // 使用新 token 重试原始请求
                headers['Authorization'] = newAccessToken;
                const retryFetchInit = { ...init, headers };
                response = await originalFetch(input, retryFetchInit);
            } else {
                console.log('Token 刷新失败:', refreshData.msg);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login'; // 重定向到登录
            }
        } else {
            console.log('刷新 token 端点失败。');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login'; // 重定向到登录
        }
    }
    return response;
};
```

**优势**:
- 所有 API 调用的自动 token 注入
- 401 响应时自动 token 刷新
- 刷新失败时自动登录重定向
- 适用于已认证和访客用户
- 无需在 API 调用中手动传递 tokens

### 2. 后端异常处理修复

#### TourOperationServiceImpl 修复

**文件**: `DVINE-MVP/backend/DVINE-EXPERIENCE/DVINE-SERVICE/src/main/java/com/dvineservice/service/impl/TourOperationServiceImpl.java`

**问题**: 对有效的"无结果"场景抛出 `NotFoundException`

**修复**:
```java
@Override
public List<Tour> search(TourQueryParam tourQueryParam) {
    List<Tour> tour = tourMapper.search(tourQueryParam);
    
    // 如果按 createdBy 搜索（用户自己的旅游），返回空列表而不是抛出异常
    // 这允许用户即使还没有创建旅游也能看到他们的旅游页面
    if (tour.isEmpty() && tourQueryParam.getCreatedBy() != null) {
        return tour; // 为用户自己的旅游返回空列表
    }
    
    // 对于一般搜索（无特定条件）或系统中没有旅游时，
    // 返回空列表而不是抛出异常
    // 这允许管理页面即使没有旅游数据也能加载
    if (tour.isEmpty() && 
        tourQueryParam.getTourId() == null && 
        tourQueryParam.getCatalogueId() == null && 
        tourQueryParam.getCatalogueName() == null && 
        tourQueryParam.getTitle() == null && 
        tourQueryParam.getDestination() == null && 
        tourQueryParam.getMinPrice() == null && 
        tourQueryParam.getMaxPrice() == null) {
        return tour; // 为一般搜索返回空列表
    }
    
    // 对于其他有特定过滤器的搜索条件，如果没找到旅游则抛出异常
    if (tour.isEmpty()) {
        throw new NotFoundException("Tour not found");
    }
    return tour;
}
```

**优势**:
- 合作伙伴用户即使没有创建旅游也能访问他们的旅游页面
- 经理/所有者用户即使没有旅游数据也能访问管理页面
- 特定搜索仍然适当地抛出异常

### 3. 前端组件简化

#### 移除手动 Token 处理

**修改的文件**:
- `AuthProvider.jsx`
- `UserListForm.jsx`
- `UserSettings.jsx`
- `AdminTourPage.jsx`
- `CreateTours.js`
- `CurrentUploadedTours.jsx`
- `TourDetails.jsx`
- `Home.jsx`
- `Catalogue.jsx`

**变更**:
- 移除 `apiRequest` 工具使用
- 简化为使用普通 `fetch` 调用
- 移除手动 token 参数传递
- 移除 `apiUtils.js` 和 `SubmitTokenRefresh.js` 文件

**修改前示例**:
```javascript
const response = await apiRequest(
    'http://localhost:8080/users/profile',
    { method: 'GET' },
    setToken,
    navigate,
    showSnackbar
);
```

**修改后示例**:
```javascript
const response = await fetch('http://localhost:8080/users/profile');
```

### 4. Bug 修复

#### Catalogue.jsx 删除按钮修复

**问题**: 删除旅游按钮调用了 `handleDeleteCatalogue(tour.tourId)` 而不是删除旅游

**修复**:
```javascript
// 添加 handleDeleteTour 函数
const handleDeleteTour = async (tourId) => {
    if (!window.confirm("您确定要删除这个旅游吗？")) {
        return;
    }

    try {
        const result = await deleteTour(tourId, token);
        if (result.code === 0) {
            fetchToursData();
        } else {
            setError("删除旅游失败");
        }
    } catch (error) {
        console.error("删除旅游错误:", error);
        setError("删除旅游失败");
    }
};

// 修复按钮 onClick
<IconButton
    size="small"
    onClick={(e) => {
        e.stopPropagation();
        handleDeleteTour(tour.tourId); // 修复: 之前是 handleDeleteCatalogue(tour.tourId)
    }}
    color="error"
>
    <DeleteIcon />
</IconButton>
```

#### FAQ.jsx DOM 嵌套修复

**问题**: `<button>` 元素嵌套在其他 `<button>` 元素内

**修复**: 将 `IconButton` 元素从 `AccordionSummary` 移动到 `AccordionDetails`

## 如何使用新系统

### 对于开发者

#### 1. 进行 API 调用

**修改前（手动 Token 处理）**:
```javascript
import { apiRequest } from "../utils/apiUtils";

const response = await apiRequest(
    'http://localhost:8080/users/profile',
    { method: 'GET' },
    setToken,
    navigate,
    showSnackbar
);
```

**修改后（自动 Token 处理）**:
```javascript
const response = await fetch('http://localhost:8080/users/profile');
const data = await response.json();
```

#### 2. 添加新的 API 端点

直接使用 `fetch` - tokens 会自动注入:

```javascript
const createNewResource = async (resourceData) => {
    const response = await fetch('http://localhost:8080/resources', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(resourceData)
    });
    return await response.json();
};
```

#### 3. 错误处理

全局拦截器自动处理大多数认证错误。对于自定义错误处理:

```javascript
const response = await fetch('http://localhost:8080/api/endpoint');
if (!response.ok) {
    if (response.status === 401) {
        // Token 刷新自动处理
        console.log('Token 已自动刷新');
    } else if (response.status === 403) {
        // 权限被拒绝
        console.error('权限被拒绝');
    } else {
        // 其他错误
        console.error('API 错误:', response.status);
    }
}
```

### 对于用户

#### 1. 自动 Token 刷新

- **无需操作**: Tokens 在后台自动刷新
- **无缝体验**: 用户不会注意到 tokens 何时刷新
- **自动登录**: 如果刷新失败，用户会自动重定向到登录页面

#### 2. 访客用户兼容性

- **公开页面**: 首页、旅游、目录页面无需登录即可工作
- **需要认证**: 受保护的页面需要登录
- **平滑过渡**: 在公开和私人区域之间切换时不会中断

## 测试修复

### 1. Token 过期测试

1. **登录** 任何用户
2. **等待 2 小时**（或在浏览器开发工具中手动使 token 过期）
3. **导航** 到受保护的页面（仪表板、设置等）
4. **验证** 页面无需手动刷新即可正确加载

### 2. 访客用户测试

1. **清除** 所有认证数据
2. **访问** 公开页面（首页、旅游、目录）
3. **验证** 页面正确加载
4. **尝试** 访问受保护的页面
5. **验证** 自动重定向到登录

### 3. 管理页面测试

1. **登录** 为经理/所有者
2. **访问** 管理页面（旅游审批、用户管理）
3. **验证** 即使没有数据页面也能加载
4. **测试** 创建和删除资源

## 需要认证的 API 端点

基于 Swagger 文档，这些端点需要认证:

### 用户管理
- `GET /users/profile` - 获取用户资料
- `PUT /users/profile` - 更新用户资料
- `GET /users/list` - 列出所有用户（经理+）

### 旅游管理
- `POST /tours` - 创建旅游（合作伙伴+）
- `PUT /tours` - 更新旅游（合作伙伴+）
- `DELETE /tours` - 删除旅游（合作伙伴+）

### 目录管理
- `POST /catalogues` - 创建目录（经理+）
- `PUT /catalogues` - 更新目录（经理+）
- `DELETE /catalogues` - 删除目录（经理+）

### 审批系统
- `GET /approvals/pending-tours` - 获取待审批旅游（经理+）
- `POST /approvals/tours/{id}/approve` - 审批旅游（经理+）
- `POST /approvals/tours/{id}/reject` - 拒绝旅游（经理+）
- `GET /approvals/my-submissions` - 获取用户的提交（合作伙伴+）

### 特色旅游
- `GET /featured-tours/manage` - 获取特色旅游进行管理（经理+）
- `POST /featured-tours` - 添加旅游到特色（经理+）
- `DELETE /featured-tours` - 从特色中移除旅游（经理+）

### FAQ 管理
- `POST /faqs` - 创建 FAQ（经理+）
- `PUT /faqs` - 更新 FAQ（经理+）
- `DELETE /faqs/{id}` - 删除 FAQ（经理+）

## 故障排除

### 常见问题

#### 1. 仍然收到 401 错误

**检查**:
- Token 存在于 localStorage 中
- Token 格式正确
- 后端正在运行
- 网络连接

#### 2. 无限重定向循环

**检查**:
- 刷新 token 有效
- 后端刷新端点正常工作
- 控制台中没有 JavaScript 错误

#### 3. 访客用户无法访问公开页面

**检查**:
- JWT 拦截器没有阻止公开端点
- 白名单配置正确

### 调试模式

通过在浏览器控制台添加以下内容启用调试日志:

```javascript
// 启用详细日志
localStorage.setItem('debugJWT', 'true');

// 检查 token 状态
console.log('访问 Token:', localStorage.getItem('accessToken'));
console.log('刷新 Token:', localStorage.getItem('refreshToken'));
```

## 性能考虑

### 优势
- **减少包大小**: 移除了 `apiUtils.js` 和 `SubmitTokenRefresh.js`
- **简化代码**: 组件中无需手动 token 管理
- **更好的用户体验**: 无需用户干预的自动 token 刷新

### 监控
- 监控 token 刷新频率
- 跟踪失败的刷新尝试
- 监控 API 调用成功率

## 安全考虑

### Token 存储
- Tokens 存储在 localStorage 中（生产环境考虑使用 httpOnly cookies）
- 登出时自动清理
- 安全的 token 传输

### 刷新 Token 安全
- 刷新 tokens 有更长的过期时间
- 刷新失败时自动登出
- 安全的刷新端点

## 未来改进

### 潜在增强
1. **HttpOnly Cookies**: 将 tokens 移动到安全 cookies
2. **Token 轮换**: 实现刷新 token 轮换
3. **离线支持**: 缓存响应以支持离线访问
4. **渐进增强**: 对旧浏览器的优雅降级

### 监控
1. **Token 分析**: 跟踪 token 使用模式
2. **错误报告**: 监控认证失败
3. **性能指标**: 测量 API 调用性能

## 结论

实施的 JWT token 处理系统提供:

- **所有 API 调用的自动 token 管理**
- **后台 token 刷新的无缝用户体验**
- **公开页面的访客用户兼容性**
- **集中化 token 处理的简化开发**
- **自动回退的健壮错误处理**

这个解决方案消除了各个组件的手动 token 管理负担，同时提供了可靠和用户友好的认证体验。 