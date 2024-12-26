package com.ssafy.foss.security.handler;

import com.ssafy.foss.jwt.utils.JwtUtils;
import com.ssafy.foss.member.domain.PrincipalDetail;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;
import java.util.Map;

@Slf4j
public class CommonLoginSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        PrincipalDetail principal = (PrincipalDetail) authentication.getPrincipal();

        log.info("=== 로그인 성공 ===");
        log.info("authentication.getPrincipal() = {}", principal);

        Map<String, Object> responseMap = principal.getMemberInfo();
        String tempToken = JwtUtils.generateToken(responseMap, 5);

        log.info("로그인한 사용자 식별자: " + responseMap.get("id"));
        response.sendRedirect("http://localhost:5173?tempToken=" + tempToken);
    }
}
