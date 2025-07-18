package com.dvinedao.mapper;

import com.dvinedao.domain.Faq;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FaqMapper {
    int createFaq(Faq faq);
    List<Faq> findAll();
    Faq findById(@Param("faqId") Long faqId);
    int updateFaq(Faq faq);
    int deleteFaq(@Param("faqId") Long faqId);
}